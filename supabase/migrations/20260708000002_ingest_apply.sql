-- Atomic ingestion apply: archive the previous Current upload of the same
-- type, insert the new version, and upsert the month row — one transaction.
-- Called ONLY by the ingest-report Edge Function with the service role.
-- The caller computes the new month state (prototype confirmUpload rules) in
-- TypeScript from a fresh read; a per-client advisory lock serialises
-- concurrent ingests so version numbers and archives can't interleave.

create or replace function public.ingest_apply(
  p_client_id uuid,
  p_type text,
  p_as_of date,
  p_file_path text,
  p_summary jsonb,
  p_month date,
  p_month_status text,
  p_budget numeric,
  p_target_cpl numeric,
  p_days_elapsed int,
  p_days_in_month int,
  p_report jsonb,
  p_uploaded_by uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev_id uuid;
  v_prev_version int;
  v_prev_summary jsonb;
  v_version int := 1;
  v_upload_id uuid;
  v_month_created boolean;
begin
  -- serialise all ingests for this client
  perform pg_advisory_xact_lock(hashtext('ingest_' || p_client_id::text));

  select id, version, summary
    into v_prev_id, v_prev_version, v_prev_summary
    from report_uploads
   where client_id = p_client_id and type = p_type and status = 'Current'
   order by version desc
   limit 1
   for update;

  if v_prev_id is not null then
    update report_uploads set status = 'Archived' where id = v_prev_id;
    v_version := v_prev_version + 1;
  end if;

  insert into report_uploads
    (client_id, type, as_of, version, status, file_path, summary, prev_summary, uploaded_by)
  values
    (p_client_id, p_type, p_as_of, v_version, 'Current', p_file_path, p_summary, v_prev_summary, p_uploaded_by)
  returning id into v_upload_id;

  insert into months
    (client_id, month, status, budget, target_cpl, days_elapsed, days_in_month, report)
  values
    (p_client_id, p_month, p_month_status, p_budget, p_target_cpl, p_days_elapsed, p_days_in_month, p_report)
  on conflict (client_id, month) do update
    set budget        = excluded.budget,
        target_cpl    = excluded.target_cpl,
        days_elapsed  = excluded.days_elapsed,
        days_in_month = excluded.days_in_month,
        report        = excluded.report
        -- status deliberately untouched on update: publishing state is a
        -- review-desk decision, uploads never change it
  returning (xmax = 0) into v_month_created;

  return jsonb_build_object(
    'upload_id', v_upload_id,
    'version', v_version,
    'archived_version', v_prev_version,
    'month_created', v_month_created
  );
end;
$$;

comment on function public.ingest_apply is
  'Atomic upload versioning + month upsert for the ingest-report Edge Function (service role only).';

revoke execute on function public.ingest_apply(uuid, text, date, text, jsonb, date, text, numeric, numeric, int, int, jsonb, uuid) from public;
revoke execute on function public.ingest_apply(uuid, text, date, text, jsonb, date, text, numeric, numeric, int, int, jsonb, uuid) from anon;
revoke execute on function public.ingest_apply(uuid, text, date, text, jsonb, date, text, numeric, numeric, int, int, jsonb, uuid) from authenticated;
grant execute on function public.ingest_apply(uuid, text, date, text, jsonb, date, text, numeric, numeric, int, int, jsonb, uuid) to service_role;
