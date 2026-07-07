// EFG Consulting · Meta Ads client reports
// One cached report per client per month. Generated internally, reviewed, then published.
// Clients only ever read these. Nothing here is computed live.

export const DB = {
  clients: [
    {
      id: 'capital_transport',
      name: 'Capital Transport',
      initials: 'CT',
      colour: '#2E3192',
      logo: 'assets/capital-transport-logo.png',
      contact: 'Tom Read',
      contact_role: 'National Account Manager',
      industry: 'Transport and Logistics',
      objective: 'Lead generation',
      manager: 'Mia Chen',
      currency: 'AUD',
      report_uploads: [
        { id: 'u4', type: 'A/B Testing', as_of: '6 Jul 2026', uploaded: '7 Jul 2026, 6:10am', file: 'CT A-B Testing Log to 6 Jul 2026.json', status: 'Current', version: 1,
          summary: { tests: 3, completed: 2, spend: 1537.6, results: 193, avg: 7.97 } },
        { id: 'u3', type: 'Daily Tracker', as_of: '6 Jul 2026', uploaded: '7 Jul 2026, 6:05am', file: 'Capital_Transport_Daily_Budget_Tracker_July2026_2026-07-06.json', status: 'Current', version: 2,
          summary: { mtd: 5591.42, remaining: 19983.58, days: 6, avg: 931.9 },
          prev_summary: { mtd: 4652.11, remaining: 20922.89, days: 5, avg: 930.42 } },
        { id: 'u2', type: 'Daily Tracker', as_of: '5 Jul 2026', uploaded: '6 Jul 2026, 6:02am', file: 'Capital_Transport_Daily_Budget_Tracker_July2026_2026-07-05.json', status: 'Archived', version: 1,
          summary: { mtd: 4652.11, remaining: 20922.89, days: 5, avg: 930.42 } },
        { id: 'u1', type: 'Meta Dashboard', as_of: '4 Jul 2026', uploaded: '5 Jul 2026, 9:12am', file: 'Capital_Transport_Meta_Ads_Dashboard_July2026_MTD_2026-07-04.json', status: 'Current', version: 1,
          summary: { spend: 3629.06, leads: 329, cpl: 11.03, ctr: 2.14, cpc: 0.61, days: 4 } }
      ],
      months: {
        '2026-07': {
          label: 'July 2026',
          status: 'Published',
          updated: '5 Jul 2026, 9:12am',
          days_elapsed: 4, days_in_month: 31,
          budget: 25575, target_cpl: 16.42,
          summary: {
            health: 'Watch',
            text: 'Four days in, 329 leads at $11.03 each, well under the $16.42 target. Spend is pacing about 10% ahead of plan, so July projects to finish over budget unless the boost campaigns are trimmed.',
            recommendation: 'Set the Employment special ad category on all driver campaigns this week, and review NSW, the only state above target.',
            pills: ['Budget · pacing ahead of plan', 'Leads · 329 in four days', 'CPL · $11.03 v $16.42 target']
          },
          metrics: { spend: 3629.06, leads: 329, cpl: 11.03, ctr: 2.14, cpc: 0.61, conv: 12.7, forecast: 28125 },
          prev: null,
          cpl_trend: [
            { label: '1 Jul', val: 12.57 }, { label: '2 Jul', val: 11.16 },
            { label: '3 Jul', val: 9.63 }, { label: '4 Jul', val: 11.03 }
          ],
          tracker: [
            { date: 1, full_date: '2026-07-01', vic: 131.28, nsw: 297.49, qld: 244.58, sa: 121.56, wa: 45.10, boost_spike: 29.27, test: 85.93, daily_total: 955.21, mtd_total: 955.21, budget_remaining: 24619.79 },
            { date: 2, full_date: '2026-07-02', vic: 73.75, nsw: 361.95, qld: 145.70, sa: 104.45, wa: 47.01, boost_spike: 146.56, test: 69.58, daily_total: 949.00, mtd_total: 1904.21, budget_remaining: 23670.79 },
            { date: 3, full_date: '2026-07-03', vic: 66.23, nsw: 331.22, qld: 134.66, sa: 83.20, wa: 52.28, boost_spike: 158.38, test: 60.29, daily_total: 886.26, mtd_total: 2790.47, budget_remaining: 22784.53 },
            { date: 4, full_date: '2026-07-04', vic: 68.33, nsw: 309.50, qld: 130.48, sa: 93.26, wa: 44.74, boost_spike: 136.05, test: 56.23, daily_total: 838.59, mtd_total: 3629.06, budget_remaining: 21945.94 },
            { date: 5, full_date: '2026-07-05', vic: 86.57, nsw: 345.36, qld: 159.28, sa: 108.47, wa: 55.60, boost_spike: 192.40, test: 75.37, daily_total: 1023.05, mtd_total: 4652.11, budget_remaining: 20922.89 },
            { date: 6, full_date: '2026-07-06', vic: 80.08, nsw: 273.87, qld: 170.87, sa: 114.67, wa: 55.29, boost_spike: 171.13, test: 73.40, daily_total: 939.31, mtd_total: 5591.42, budget_remaining: 19983.58 }
          ],
          ab_log: {"target":16.42,"windowText":"window 23 Jun 2026 – 6 Jul 2026, checked against 9 Jun 2026 – 22 Jun 2026","summary":{"detected":3,"active":1,"completed":2,"gathering":1,"text":"Detected 3 A/B test(s) in the window: 2 with enough data to act on and 1 still gathering. 1 produced a clear winner; 1 do not yet have enough data. Tests are concentrated on creative, copy, call to action and messaging angle. Where variations differ on more than one element the test_type lists each, since the cause is not isolated."},"tests":[{"id":"ct_ab_vic_angle_6_tautliner_","name":"Angle 6 - Tautliner: Creative (image) test","group":"VIC","campaign":"VIC JCF | TOF | Experimental Campaign","type":"Creative (image)","status":"Complete","confidence":"Medium confidence","verdict":"winner","conclusion":"Clear winner: 'Ad 6 - Plain real image' at A$8.42 per result, below the A$16.42 target. It beats the next best by about 20 percent.","next":"Shift budget to 'Ad 6 - Plain real image', pause or retire 'Ad 6 - Text on image', and build the next test against 'Ad 6 - Plain real image' as the benchmark.","client":"For VIC, the ad 'Ad 6 - Plain real image' is getting applicants most cheaply and should get more budget.","reasoning":"All variations run in the 'Angle 6 - Tautliner' ad set, so the difference comes from the creative (image). 'Ad 6 - Plain real image' is the strongest at A$8.42 per result on 21 results. In the comparison period it ran at A$9.29, so the result is consistent. 'Ad 6 - Text on image' is the least efficient at A$10.07. This is a deliberately set up test campaign.","best":"Ad 6 - Plain real image","worst":"Ad 6 - Text on image","spend":287.61,"results":32,"avg":8.99,"variants":[{"name":"Ad 6 - Plain real image","ad":"Ad 6 - Plain real image","spend":176.88,"results":21,"cpr":8.42,"ctr":2.05,"freq":2.25},{"name":"Ad 6 - Text on image","ad":"Ad 6 - Text on image","spend":110.73,"results":11,"cpr":10.07,"ctr":2.14,"freq":1.79}]},{"id":"ct_ab_nsw_nsw_broad_trucks_","name":"NSW | Broad | Trucks: Creative / Headline / Copy test","group":"NSW","campaign":"NSW | Leads | New Campaign | MOF","type":"Creative / Headline / Copy","status":"In progress","confidence":"Low confidence","verdict":"data","conclusion":"Not enough data yet. Each variation has too little spend or too few results to compare fairly, and the test has only just started.","next":"Keep the test running with steady budget until each variation has at least 10 results and 7 days of data, then compare.","client":"This NSW test does not have enough data yet to pick a winner; it needs more time and budget.","reasoning":"All variations run in the 'NSW | Broad | Trucks' ad set, so the difference comes from the creative / headline / copy.","best":null,"worst":null,"spend":127.07,"results":47,"avg":2.7,"variants":[{"name":"SI | 8T Tautliner","ad":"SI | 8T Tautliner","spend":75.91,"results":35,"cpr":2.17,"ctr":7.75,"freq":1.4},{"name":"SI | 6T and 8T Tautliners (Meta AI)","ad":"SI | 6T and 8T Tautliners (Meta AI)","spend":41.4,"results":10,"cpr":4.14,"ctr":8,"freq":1.25},{"name":"SI | 12T Bill Clarkson (Meta AI)","ad":"SI | 12T Bill Clarkson (Meta AI)","spend":9.76,"results":2,"cpr":4.88,"ctr":5.51,"freq":1.42}]},{"id":"ct_ab_vic_vic_jcf_tof_experimental_campaign_","name":"Messaging angle test across ad sets","group":"VIC","campaign":"VIC JCF | TOF | Experimental Campaign","type":"Audience / Messaging angle","status":"Complete","confidence":"Medium confidence","verdict":"none","conclusion":"No clear winner: the credible variations perform within 15 percent of each other on cost per result.","next":"Keep the strongest variation as the control and test a more distinct change (creative, copy, offer or call to action) to create a real difference.","client":"No clear winner: the credible variations perform within 15 percent of each other on cost per result.","reasoning":"All variations run in this campaign, so the difference comes from the audience / messaging angle. 'Ad 6 - Plain real image' is the strongest at A$8.42 per result on 21 results. In the comparison period it ran at A$9.29, so the result is consistent. 'Ad 5 - Van image' is the least efficient at A$14.33. This is a deliberately set up test campaign.","best":"Ad 6 - Plain real image","worst":"Ad 5 - Van image","spend":1122.92,"results":114,"avg":9.85,"variants":[{"name":"Angle 2 - Start this week in Melbourne","ad":"Ad 2 -  Plain Text","spend":483.14,"results":50,"cpr":9.66,"ctr":1.36,"freq":2.13},{"name":"L2 | Angle 3 Courier Drivers","ad":"L2 Angle 3 - image","spend":319.64,"results":33,"cpr":9.69,"ctr":3,"freq":1.72},{"name":"Angle 6 - Tautliner","ad":"Ad 6 - Plain real image","spend":176.88,"results":21,"cpr":8.42,"ctr":2.05,"freq":2.25},{"name":"Angle 5 - We've got your next run ready","ad":"Ad 5 - Van image","spend":143.26,"results":10,"cpr":14.33,"ctr":2.04,"freq":2.06}]}]},
          campaigns: [
            { id: 'c1', name: 'NSW Campaigns', objective: 'Leads', status: 'Active', spend: 781, leads: 34, cpl: 22.97, ctr: 1.16, cpc: 1.25, health: 'attention', healthLabel: 'Above target',
              quality: 'Only state above the $16.42 target. Trucks and Van/Ute ad sets both need work.',
              action: 'Refresh creative and review the landing page before adding budget.' },
            { id: 'c2', name: 'NSW | Leads | Testing Creatives | MOF', objective: 'Leads', status: 'Active', spend: 502, leads: 53, cpl: 9.47, ctr: 3.42, cpc: 0.39, health: 'strong', healthLabel: 'Strong',
              quality: 'Best click rate in the account at 3.4%. The contract vans and utes angle is winning.',
              action: 'Scale the winning angles into the state campaigns.' },
            { id: 'c3', name: 'QLD Campaigns | Crane | Oct 25', objective: 'Leads', status: 'Active', spend: 411, leads: 42, cpl: 9.79, ctr: 1.67, cpc: 0.68, health: 'strong', healthLabel: 'Strong',
              quality: 'The simple no fluff crane truck ad carries this campaign.',
              action: 'Protect and consider scaling.' },
            { id: 'c4', name: 'SA Campaigns', objective: 'Leads', status: 'Active', spend: 398, leads: 27, cpl: 14.74, ctr: 1.61, cpc: 0.76, health: 'ok', healthLabel: 'Near target',
              quality: 'Under target but the closest to it of the healthy states.',
              action: 'Monitor weekly.' },
            { id: 'c5', name: 'VIC Campaigns – New Campaign', objective: 'Leads', status: 'Active', spend: 332, leads: 31, cpl: 10.71, ctr: 2.26, cpc: 0.71, health: 'strong', healthLabel: 'Strong',
              quality: 'Most efficient state. The couriers ad set is near $7 per lead.',
              action: 'Protect and scale.' },
            { id: 'c6', name: 'VIC JCF | TOF | Experimental Campaign', objective: 'Leads', status: 'Active', spend: 271, leads: 32, cpl: 8.47, ctr: 1.79, cpc: 0.63, health: 'strong', healthLabel: 'Strong',
              quality: 'Angle 2, Start this week in Melbourne, leads the test.',
              action: 'Roll the winning angle into the VIC state campaign.' },
            { id: 'c7', name: 'Spike | NSW | Cranes and Tray Trucks | MOF', objective: 'Leads', status: 'Active', spend: 266, leads: 50, cpl: 5.32, ctr: 2.96, cpc: 0.28, health: 'strong', healthLabel: 'Strong',
              quality: 'Cheapest leads in the account at $5.32.',
              action: 'Watch frequency, already at 2.8.' },
            { id: 'c8', name: 'Spike | QLD | Crane & Hydraulic | MOF', objective: 'Leads', status: 'Active', spend: 251, leads: 14, cpl: 17.93, ctr: 2.45, cpc: 0.40, health: 'attention', healthLabel: 'Over target',
              quality: 'The 12T crane ad set is running near $32 per lead.',
              action: 'Review the landing page or pause the 12T ad set.' },
            { id: 'c9', name: 'QLD Targeted Campaigns', objective: 'Leads', status: 'Active', spend: 225, leads: 26, cpl: 8.65, ctr: 1.72, cpc: 1.08, health: 'strong', healthLabel: 'Strong',
              quality: 'Small and efficient.', action: 'No change.' },
            { id: 'c10', name: 'WA Campaigns – New', objective: 'Leads', status: 'Active', spend: 191, leads: 20, cpl: 9.55, ctr: 1.42, cpc: 1.21, health: 'strong', healthLabel: 'Strong',
              quality: 'Small spend, steady flow.', action: 'No change.' }
          ],
          creatives: [
            { id: 'cr1', name: 'SI | 2 Tonne Van', type: 'Image', tag: 'best', tagLabel: 'Best performer', cpl: 8.26, ctr: 4.03, freq: 1.8,
              note: 'A 4% click rate in the NSW creative test. Simple van shot with a plain offer.',
              rec: 'Roll into the NSW state campaign to bring its cost per lead down.' },
            { id: 'cr2', name: 'Simple no fluff crane truck ad', type: 'Image', tag: 'best', tagLabel: 'Strong', cpl: 9.93, ctr: 1.73, freq: 1.59,
              note: 'Carries the QLD crane campaign. No fatigue detected.',
              rec: 'Keep running. Duplicate the format for other vehicle types.' },
            { id: 'cr3', name: '8T Taut Tgate 2man Crew', type: 'Image', tag: 'worst', tagLabel: 'Underperforming', cpl: 25.72, ctr: 1.07, freq: 1.71,
              note: 'Oldest NSW creative. Costs $25.72 per lead against the $16.42 target.',
              rec: 'Refresh creative, flagged in the NSW review.' }
          ],
          audiences: [
            { name: 'NSW | Broad | 6T Tonne + (Spike)', spend: 214, leads: 44, cpl: 4.90, note: 'Cheapest leads in the account. Broad targeting is doing the work.' },
            { name: 'QLD Crane – 8-12t Crane', spend: 411, leads: 41, cpl: 10.02, note: 'Carries the QLD crane campaign.' },
            { name: 'NSW Trucks', spend: 394, leads: 16, cpl: 24.63, note: 'Above target. Landing page review booked.' }
          ],
          actions: [
            { id: 'a1', title: 'Set the Employment special ad category on all driver campaigns', why: 'Driver recruitment ads must declare the Employment category to stay compliant.',
              owner: 'EFG · Mia', priority: 'High', due: '8 Jul', status: 'urgent', impact: 'Removes the risk of ads being paused mid month.', keep: true },
            { id: 'a2', title: 'Review NSW creative and landing page', why: 'NSW is the only state above target at $22.97 per lead.',
              owner: 'EFG · Mia', priority: 'High', due: '10 Jul', status: 'week', impact: 'NSW at target is worth roughly 12 extra leads a week.', keep: true },
            { id: 'a3', title: 'Scale winning test angles into state campaigns', why: 'The NSW creative test is producing $9.47 leads with a 3.4% click rate.',
              owner: 'EFG · Mia', priority: 'Medium', due: '12 Jul', status: 'week', impact: 'Lifts the whole account toward test level cost per lead.', keep: true },
            { id: 'a4', title: 'Trim boost campaigns if the overspend pace holds', why: 'Projected month end is about $28,100 against the $25,575 budget.',
              owner: 'EFG · Mia', priority: 'Medium', due: '14 Jul', status: 'monitor', impact: 'Keeps July inside the committed budget.', keep: true },
            { id: 'a5', title: 'Progress SubHub and CAPI integration', why: 'Optimising on hires, not just leads, is the agreed next step.',
              owner: 'You · Tom', priority: 'Medium', due: 'Review 20 Jul', status: 'monitor', impact: 'Better quality signal for Meta optimisation.', keep: true }
          ],
          changed: [
            { area: 'Spend', chip: '+10%', detail: 'Pacing about 10% ahead of the $825 daily plan.' },
            { area: 'CPL', chip: '$11.03', detail: 'Well under the $16.42 target in every state except NSW.' },
            { area: 'Leads', chip: '329', detail: '329 leads in four days. Recent days may still rise with attribution.' },
            { area: 'Tests', chip: '2 live', detail: 'NSW creative test and VIC JCF angles are both beating the state campaigns.' }
          ],
          attention: [
            { issue: 'NSW cost per lead is $22.97 against the $16.42 target', impact: 'NSW takes 22% of spend, so it drags the whole account.',
              step: 'Creative refresh and landing page review this week.', priority: 'High' },
            { issue: 'Spend is pacing about 10% ahead of plan', impact: 'Projects to roughly $28,100 by month end, about $2,500 over.',
              step: 'Trim the boost campaigns if the pace holds past mid July.', priority: 'Medium' }
          ],
          working: [
            { title: 'Boost campaigns are the cheapest lead source', detail: 'The NSW cranes and tray trucks spike is at $5.32 per lead.' },
            { title: 'Creative tests are beating the state campaigns', detail: '$9.47 per lead with a 3.4% click rate in NSW testing.' },
            { title: 'Four of five states are under target', detail: 'VIC, QLD, SA and WA are all below $16.42. Only NSW is above.' }
          ],
          notes: [
            { id: 'n1', text: 'Lead reporting uses 7 day click and 1 day view attribution, so the last three days may still mature upward.', visible: true },
            { id: 'n2', text: 'Monthly budget is the FY27 committed daily target of $825 across 31 days.', visible: true }
          ]
        },
        '2026-08': { label: 'August 2026', status: 'Planned', budget: 25575, target_cpl: 16.42 },
        '2026-09': { label: 'September 2026', status: 'Planned', budget: 25575, target_cpl: 16 }
      }
    },
    {
      id: 'coastal_dental',
      name: 'Coastal Dental',
      initials: 'CD',
      colour: '#0E7490',
      contact: 'Dr Lien Nguyen',
      contact_role: 'Practice Owner',
      industry: 'Health and Dental',
      objective: 'Consultation bookings',
      manager: 'Tom Riley',
      currency: 'AUD',
      months: {
        '2026-07': {
          label: 'July 2026',
          status: 'Approved',
          updated: '5 Jul 2026, 4:10pm',
          days_elapsed: 6, days_in_month: 31,
          budget: 3000, target_cpl: 45,
          summary: {
            health: 'Strong',
            text: 'A clean start to July. Bookings are cheaper than target and spend is right on plan. Invisalign is the one campaign running a little dear.',
            recommendation: 'Shift $150 to the whitening retarget while Invisalign targeting is reworked.',
            pills: ['Budget · on plan', 'Bookings · steady', 'CPL · under target']
          },
          metrics: { spend: 590, leads: 15, cpl: 39, ctr: 2.4, cpc: 1.05, conv: 2.6, forecast: 3050 },
          prev:    { spend: 2960, leads: 68, cpl: 44, ctr: 2.2, cpc: 1.10, conv: 2.5, label: 'June' },
          cpl_trend: [
            { label: 'W1 Jun', val: 46 }, { label: 'W2 Jun', val: 45 }, { label: 'W3 Jun', val: 43 },
            { label: 'W4 Jun', val: 42 }, { label: 'W1 Jul', val: 39 }
          ],
          campaigns: [
            { id: 'c1', name: 'Invisalign consultations', objective: 'Leads', status: 'Active', spend: 330, leads: 7, cpl: 47, ctr: 1.9, cpc: 1.15, health: 'attention', healthLabel: 'Over target',
              quality: 'Good fits, but each booking costs a little over target.', action: 'Rework interest targeting this week.' },
            { id: 'c2', name: 'Whitening · Retargeting', objective: 'Leads', status: 'Active', spend: 180, leads: 6, cpl: 30, ctr: 3.1, cpc: 0.90, health: 'strong', healthLabel: 'Strong',
              quality: 'Cheapest bookings in the account.', action: 'Top up budget by $150.' },
            { id: 'c3', name: 'New patient check ups', objective: 'Leads', status: 'Active', spend: 80, leads: 2, cpl: 40, ctr: 2.0, cpc: 1.10, health: 'ok', healthLabel: 'On track',
              quality: 'Small and steady.', action: 'No change.' }
          ],
          creatives: [
            { id: 'cr1', name: 'Smile before and after', type: 'Carousel', tag: 'best', tagLabel: 'Best performer', cpl: 31, ctr: 3.2, freq: 2.1,
              note: 'Before and after frames carry it. People swipe all the way through.', rec: 'Keep running as is.' },
            { id: 'cr2', name: 'Dentist welcome video', type: 'Video', tag: 'fatigue', tagLabel: 'Wearing out', cpl: 49, ctr: 1.6, freq: 3.2,
              note: 'Same audience has now seen it three times on average.', rec: 'Film a short new intro this month.' },
            { id: 'cr3', name: 'Price list static', type: 'Image', tag: 'worst', tagLabel: 'Underperforming', cpl: 58, ctr: 1.1, freq: 1.8,
              note: 'Too much text in the image. Weak first impression.', rec: 'Replace with a single clear offer.' }
          ],
          audiences: [
            { name: 'Site visitors, 30 days', spend: 180, leads: 6, cpl: 30, note: 'Best value audience.' },
            { name: 'Local radius, 8km', spend: 410, leads: 9, cpl: 46, note: 'Fine. Testing suburb splits next.' }
          ],
          actions: [
            { id: 'a1', title: 'Rework Invisalign targeting', why: 'Bookings cost $47 against the $45 target.', owner: 'EFG · Tom', priority: 'Medium', due: '11 Jul', status: 'week', impact: 'Gets every campaign under target.', keep: true },
            { id: 'a2', title: 'Top up whitening retarget by $150', why: 'Cheapest bookings, room to scale.', owner: 'EFG · Tom', priority: 'Medium', due: '9 Jul', status: 'week', impact: 'About five extra bookings.', keep: true },
            { id: 'a3', title: 'Film a new welcome video intro', why: 'Current one is wearing out.', owner: 'You · Dr Nguyen', priority: 'Low', due: '25 Jul', status: 'monitor', impact: 'Fresh creative for August.', keep: true },
            { id: 'a4', title: 'Set July budget and target', why: 'Agreed at review.', owner: 'EFG · Tom', priority: 'High', due: 'Done 1 Jul', status: 'done', impact: 'Plan locked.', keep: true }
          ],
          changed: [
            { area: 'CPL', chip: 'Down $5', detail: 'Bookings are $5 cheaper than the June average.' },
            { area: 'Spend', chip: 'On plan', detail: 'Tracking within 2% of plan.' },
            { area: 'Creative', chip: 'New', detail: 'Before and after carousel took over as best performer.' }
          ],
          attention: [
            { issue: 'Invisalign bookings cost $47, slightly over the $45 target', impact: 'Small for now, roughly $20 extra so far.',
              step: 'Rework targeting this week. No budget change needed.', priority: 'Medium' }
          ],
          working: [
            { title: 'Whitening retarget is flying', detail: '$30 a booking, a third under target.' },
            { title: 'Carousel creative is a keeper', detail: 'Best click rate in the account.' }
          ],
          notes: [
            { id: 'n1', text: 'School holidays start 4 July. Family check up interest usually rises for two weeks.', visible: true }
          ]
        },
        '2026-06': {
          label: 'June 2026',
          status: 'Published',
          updated: '1 Jul 2026, 9:05am',
          days_elapsed: 30, days_in_month: 30,
          budget: 3000, target_cpl: 45,
          summary: {
            health: 'On Track',
            text: 'June landed just under budget with 68 bookings at $44 each, a whisker under target. Steady month with no surprises.',
            recommendation: 'Scale the whitening retarget and brief fresh video for July.',
            pills: ['Budget · finished on plan', 'Bookings · steady', 'CPL · just under target']
          },
          metrics: { spend: 2960, leads: 68, cpl: 44, ctr: 2.2, cpc: 1.10, conv: 2.5, forecast: 2960 },
          prev:    { spend: 3010, leads: 63, cpl: 48, ctr: 2.1, cpc: 1.14, conv: 2.4, label: 'May' },
          cpl_trend: [
            { label: 'W4 May', val: 48 }, { label: 'W1 Jun', val: 46 }, { label: 'W2 Jun', val: 45 },
            { label: 'W3 Jun', val: 43 }, { label: 'W4 Jun', val: 42 }
          ],
          campaigns: [
            { id: 'c1', name: 'Invisalign consultations', objective: 'Leads', status: 'Active', spend: 1400, leads: 29, cpl: 48, ctr: 1.8, cpc: 1.20, health: 'ok', healthLabel: 'Near target',
              quality: 'Good fits. Cost hovering at target.', action: 'Targeting rework planned for July.' },
            { id: 'c2', name: 'Whitening · Retargeting', objective: 'Leads', status: 'Active', spend: 900, leads: 26, cpl: 35, ctr: 2.9, cpc: 0.95, health: 'strong', healthLabel: 'Strong',
              quality: 'Cheapest bookings.', action: 'Scale in July.' },
            { id: 'c3', name: 'New patient check ups', objective: 'Leads', status: 'Active', spend: 660, leads: 13, cpl: 51, ctr: 1.9, cpc: 1.12, health: 'ok', healthLabel: 'OK',
              quality: 'Steady.', action: 'No change.' }
          ],
          creatives: [
            { id: 'cr1', name: 'Dentist welcome video', type: 'Video', tag: 'best', tagLabel: 'Best performer', cpl: 38, ctr: 2.4, freq: 2.7,
              note: 'Carried the month, though frequency is climbing.', rec: 'Plan a refresh for July.' },
            { id: 'cr2', name: 'Smile before and after', type: 'Carousel', tag: 'fatigue', tagLabel: 'Rising star', cpl: 40, ctr: 2.8, freq: 1.6,
              note: 'Launched late June and picked up fast.', rec: 'Give it more budget in July.' },
            { id: 'cr3', name: 'Price list static', type: 'Image', tag: 'worst', tagLabel: 'Underperforming', cpl: 61, ctr: 1.0, freq: 1.9,
              note: 'Weak all month.', rec: 'Retire or rebuild.' }
          ],
          audiences: [
            { name: 'Site visitors, 30 days', spend: 900, leads: 26, cpl: 35, note: 'Backbone audience.' },
            { name: 'Local radius, 8km', spend: 2060, leads: 42, cpl: 49, note: 'Broad but works.' }
          ],
          actions: [
            { id: 'a1', title: 'Launch before and after carousel', why: 'Needed a challenger creative.', owner: 'EFG · Tom', priority: 'Medium', due: 'Done 24 Jun', status: 'done', impact: 'Became best performer within a week.', keep: true },
            { id: 'a2', title: 'Agree July plan', why: 'Monthly review.', owner: 'You · Dr Nguyen', priority: 'High', due: 'Done 29 Jun', status: 'done', impact: 'July locked.', keep: true }
          ],
          changed: [
            { area: 'CPL', chip: 'Down $4', detail: 'Down $4 on May.' },
            { area: 'Bookings', chip: 'Up 8%', detail: '68 against 63 in May.' },
            { area: 'Creative', chip: 'New', detail: 'Carousel launched 24 June.' }
          ],
          attention: [
            { issue: 'Welcome video frequency at 2.7 and rising', impact: 'Likely wear out by mid July.', step: 'Brief a new intro now.', priority: 'Medium' }
          ],
          working: [
            { title: 'Whitening retarget stayed cheap', detail: '$35 a booking all month.' },
            { title: 'New carousel took off', detail: 'Best click rate within a week of launch.' }
          ],
          notes: [
            { id: 'n1', text: 'Practice closed the long weekend 6 to 8 June. Bookings dipped then recovered.', visible: true }
          ]
        },
        '2026-05': {
          label: 'May 2026', status: 'Published', updated: '1 Jun 2026, 9:30am',
          days_elapsed: 31, days_in_month: 31, budget: 3000, target_cpl: 48,
          summary: { health: 'On Track', text: 'May landed just under budget with 62 bookings at $48 each, right on target. A steady month.', recommendation: 'Test a before and after carousel in June.', pills: ['Budget · finished on plan', 'Bookings · steady', 'CPL · on target'] },
          metrics: { spend: 2985, leads: 62, cpl: 48, ctr: 2.1, cpc: 1.14, conv: 2.4, forecast: 2985 },
          prev: { spend: 2900, leads: 55, cpl: 53, ctr: 2.0, cpc: 1.18, conv: 2.3, label: 'April' },
          cpl_trend: [ { label: 'W4 Apr', val: 53 }, { label: 'W1 May', val: 50 }, { label: 'W2 May', val: 49 }, { label: 'W3 May', val: 47 }, { label: 'W4 May', val: 46 } ],
          campaigns: [
            { id: 'c1', name: 'Invisalign consultations', objective: 'Leads', status: 'Active', spend: 1450, leads: 28, cpl: 52, ctr: 1.7, cpc: 1.25, health: 'ok', healthLabel: 'Near target', quality: 'Good fits, cost a touch high.', action: 'Carried into June.' },
            { id: 'c2', name: 'Whitening · Retargeting', objective: 'Leads', status: 'Active', spend: 820, leads: 22, cpl: 37, ctr: 2.8, cpc: 0.98, health: 'strong', healthLabel: 'Strong', quality: 'Cheapest bookings.', action: 'Scale next month.' },
            { id: 'c3', name: 'New patient check ups', objective: 'Leads', status: 'Active', spend: 715, leads: 12, cpl: 60, ctr: 1.8, cpc: 1.15, health: 'ok', healthLabel: 'OK', quality: 'Steady.', action: 'No change.' }
          ],
          creatives: [
            { id: 'cr1', name: 'Dentist welcome video', type: 'Video', tag: 'best', tagLabel: 'Best performer', cpl: 41, ctr: 2.3, freq: 2.4, note: 'Warm and personal. It carried May.', rec: 'Keep for June.' },
            { id: 'cr2', name: 'Price list static', type: 'Image', tag: 'worst', tagLabel: 'Underperforming', cpl: 63, ctr: 1.0, freq: 1.8, note: 'Too busy.', rec: 'Simplify or retire.' }
          ],
          audiences: [ { name: 'Site visitors, 30 days', spend: 820, leads: 22, cpl: 37, note: 'Backbone audience.' }, { name: 'Local radius, 8km', spend: 2165, leads: 40, cpl: 54, note: 'Broad but steady.' } ],
          actions: [
            { id: 'a1', title: 'Brief the before and after carousel', why: 'Needed a challenger creative.', owner: 'EFG · Tom', priority: 'Medium', due: 'Done 26 May', status: 'done', impact: 'Launched 24 June.', keep: true }
          ],
          changed: [ { area: 'Bookings', chip: 'Up 13%', detail: '62 against 55 in April.' }, { area: 'CPL', chip: 'Down $5', detail: '$48 against $53 in April.' } ],
          attention: [ { issue: 'Check up campaign cost $60 a booking', impact: 'Above the $48 target.', step: 'Reviewed and kept small.', priority: 'Low' } ],
          working: [ { title: 'Whitening retarget stayed strong', detail: '22 bookings at $37.' } ],
          notes: [ { id: 'n1', text: 'Target CPL was $48 in May. Tightened to $45 for June.', visible: true } ]
        },
        '2026-08': { label: 'August 2026', status: 'Planned', budget: 3200, target_cpl: 45 }
      }
    },
    {
      id: 'northside_gyms',
      name: 'Northside Gyms',
      initials: 'NG',
      colour: '#6D28D9',
      contact: 'Sarah Lim',
      contact_role: 'Studio Manager',
      industry: 'Fitness',
      objective: 'Membership sign ups',
      manager: 'Mia Chen',
      currency: 'AUD',
      months: {
        '2026-07': {
          label: 'July 2026',
          status: 'Draft',
          updated: '4 Jul 2026, 2:35pm',
          days_elapsed: 6, days_in_month: 31,
          budget: 8000, target_cpl: 30,
          summary: {
            health: 'Watch',
            text: 'Spend is running ahead of plan and sign ups are costing $35 against the $30 target. The broad lead form campaign is the main culprit and we are tightening it this week.',
            recommendation: 'Approve the tightened audience for the broad campaign so it can go live by Wednesday.',
            pills: ['Budget · pacing ahead', 'Sign ups · good volume', 'CPL · above target']
          },
          metrics: { spend: 1710, leads: 49, cpl: 35, ctr: 2.7, cpc: 0.95, conv: 2.7, forecast: 8840 },
          prev:    { spend: 7900, leads: 260, cpl: 30, ctr: 2.9, cpc: 0.92, conv: 3.0, label: 'June' },
          cpl_trend: [
            { label: 'W1 Jun', val: 29 }, { label: 'W2 Jun', val: 30 }, { label: 'W3 Jun', val: 31 },
            { label: 'W4 Jun', val: 33 }, { label: 'W1 Jul', val: 35 }
          ],
          campaigns: [
            { id: 'c1', name: '6 week challenge', objective: 'Leads', status: 'Active', spend: 900, leads: 27, cpl: 33, ctr: 2.9, cpc: 0.92, health: 'ok', healthLabel: 'Near target',
              quality: 'Strong interest. Show up rate to first session is 70%.',
              action: 'Hold. Reassess once the broad campaign is fixed.' },
            { id: 'c2', name: 'Lead form · Broad', objective: 'Leads', status: 'Active', spend: 560, leads: 14, cpl: 40, ctr: 2.2, cpc: 1.05, health: 'attention', healthLabel: 'High CPL',
              quality: 'Too broad. A third of leads are outside the catchment.',
              action: 'Tightened audience ready for approval. Target live Wednesday.' },
            { id: 'c3', name: 'IG engagers · Retarget', objective: 'Leads', status: 'Active', spend: 250, leads: 8, cpl: 31, ctr: 3.4, cpc: 0.80, health: 'strong', healthLabel: 'Strong',
              quality: 'Warm and cheap. Small audience though.',
              action: 'No change. Audience refreshes itself.' }
          ],
          creatives: [
            { id: 'cr1', name: 'Member transformation reel', type: 'Video', tag: 'best', tagLabel: 'Best performer', cpl: 27, ctr: 3.6, freq: 2.4,
              note: 'Real member, twelve week result, no gimmicks. It lands.', rec: 'Keep running. Film two more like it.' },
            { id: 'cr2', name: 'Challenge countdown static', type: 'Image', tag: 'fatigue', tagLabel: 'Wearing out', cpl: 38, ctr: 1.9, freq: 3.6,
              note: 'Frequency 3.6. The countdown angle has run its course.', rec: 'Retire after this week and replace with the new reel.' },
            { id: 'cr3', name: 'Gym floor walkthrough', type: 'Video', tag: 'worst', tagLabel: 'Underperforming', cpl: 52, ctr: 1.2, freq: 2.0,
              note: 'Looks nice, says little. No clear reason to act now.', rec: 'Re cut with an offer in the first five seconds.' }
          ],
          audiences: [
            { name: 'IG engagers, 90 days', spend: 250, leads: 8, cpl: 31, note: 'Warm and reliable.' },
            { name: 'Local radius, 5km', spend: 900, leads: 27, cpl: 33, note: 'Core audience, close to target.' },
            { name: 'Broad, 18 to 45', spend: 560, leads: 14, cpl: 40, note: 'Too loose. Tightening this week.' }
          ],
          actions: [
            { id: 'a1', title: 'Tighten the broad lead form audience', why: 'A third of its leads are outside your catchment and CPL is $40.',
              owner: 'EFG · Mia', priority: 'High', due: '8 Jul', status: 'urgent', impact: 'Should pull overall CPL back near $30.', keep: true },
            { id: 'a2', title: 'Approve the tightened audience', why: 'Needs your sign off before it goes live.',
              owner: 'You · Sarah', priority: 'High', due: '8 Jul', status: 'urgent', impact: 'Unblocks the fix above.', keep: true },
            { id: 'a3', title: 'Retire the countdown static', why: 'Frequency 3.6 and falling clicks.',
              owner: 'EFG · Mia', priority: 'Medium', due: '11 Jul', status: 'week', impact: 'Stops paying for tired creative.', keep: true },
            { id: 'a4', title: 'Film two more transformation reels', why: 'Your best ad by a distance. It needs company.',
              owner: 'You · Sarah', priority: 'Medium', due: '20 Jul', status: 'week', impact: 'Keeps the winning angle fresh into August.', keep: true },
            { id: 'a5', title: 'Watch challenge show up rate', why: 'Currently 70%. Below 60% we change the reminder flow.',
              owner: 'EFG', priority: 'Low', due: 'Ongoing', status: 'monitor', impact: 'Sign ups that actually show up.', keep: true }
          ],
          changed: [
            { area: 'Spend', chip: '+10%', detail: 'Pacing 10% ahead of plan. Forecast is $840 over unless trimmed.' },
            { area: 'CPL', chip: 'Up $5', detail: 'Up $5 on June. The broad campaign is dragging the average.' },
            { area: 'Leads', chip: 'On pace', detail: '49 in six days. Volume itself is healthy.' },
            { area: 'Creative', chip: 'Watch', detail: 'Countdown static past its best. Replacement queued.' }
          ],
          attention: [
            { issue: 'Sign ups cost $35 against the $30 target', impact: 'About $245 in extra spend so far this month.',
              step: 'Tighten the broad audience. Change ready for your approval.', priority: 'High' },
            { issue: 'Spend is pacing 10% ahead of plan', impact: 'Forecast lands $840 over budget if nothing changes.',
              step: 'Trim daily budgets on the broad campaign once retargeted.', priority: 'High' }
          ],
          working: [
            { title: 'Transformation reel is your best ad', detail: '$27 a sign up and the best click rate in the account.' },
            { title: 'Challenge show up rate is strong', detail: '70% of sign ups attend their first session.' }
          ],
          notes: [
            { id: 'n1', text: 'New Reservoir location opens 1 August. We will need a separate launch budget conversation.', visible: true },
            { id: 'n2', text: 'Sarah prefers WhatsApp for approvals. Email follow ups get missed.', visible: false }
          ]
        },
        '2026-06': {
          label: 'June 2026',
          status: 'Published',
          updated: '1 Jul 2026, 10:15am',
          days_elapsed: 30, days_in_month: 30,
          budget: 8000, target_cpl: 30,
          summary: {
            health: 'On Track',
            text: 'June hit the target almost exactly. 260 sign ups at $30 each with spend $100 under budget. CPL crept up in the last fortnight, one to watch.',
            recommendation: 'Fix the broad campaign early in July before the creep becomes a trend.',
            pills: ['Budget · finished on plan', 'Sign ups · best month yet', 'CPL · on target']
          },
          metrics: { spend: 7900, leads: 260, cpl: 30, ctr: 2.9, cpc: 0.92, conv: 3.0, forecast: 7900 },
          prev:    { spend: 7650, leads: 234, cpl: 33, ctr: 2.8, cpc: 0.94, conv: 2.9, label: 'May' },
          cpl_trend: [
            { label: 'W4 May', val: 32 }, { label: 'W1 Jun', val: 29 }, { label: 'W2 Jun', val: 30 },
            { label: 'W3 Jun', val: 31 }, { label: 'W4 Jun', val: 33 }
          ],
          campaigns: [
            { id: 'c1', name: '6 week challenge', objective: 'Leads', status: 'Active', spend: 4100, leads: 141, cpl: 29, ctr: 3.0, cpc: 0.90, health: 'strong', healthLabel: 'Strong',
              quality: 'Best month since launch.', action: 'Carry into July unchanged.' },
            { id: 'c2', name: 'Lead form · Broad', objective: 'Leads', status: 'Active', spend: 2600, leads: 76, cpl: 34, ctr: 2.4, cpc: 1.00, health: 'ok', healthLabel: 'Creeping',
              quality: 'Quality thinned in the last fortnight.', action: 'Tighten audience in July.' },
            { id: 'c3', name: 'IG engagers · Retarget', objective: 'Leads', status: 'Active', spend: 1200, leads: 43, cpl: 28, ctr: 3.3, cpc: 0.82, health: 'strong', healthLabel: 'Strong',
              quality: 'Reliable as ever.', action: 'No change.' }
          ],
          creatives: [
            { id: 'cr1', name: 'Member transformation reel', type: 'Video', tag: 'best', tagLabel: 'Best performer', cpl: 26, ctr: 3.5, freq: 2.1,
              note: 'Launched 9 June and immediately led the account.', rec: 'Hero creative for July.' },
            { id: 'cr2', name: 'Challenge countdown static', type: 'Image', tag: 'fatigue', tagLabel: 'Aging', cpl: 33, ctr: 2.3, freq: 3.1,
              note: 'Did its job for the June intake. Tiring now.', rec: 'Replace mid July.' },
            { id: 'cr3', name: 'Gym floor walkthrough', type: 'Video', tag: 'worst', tagLabel: 'Underperforming', cpl: 48, ctr: 1.3, freq: 1.9,
              note: 'Pretty but passive.', rec: 'Re cut or retire.' }
          ],
          audiences: [
            { name: 'Local radius, 5km', spend: 4100, leads: 141, cpl: 29, note: 'Core audience performing.' },
            { name: 'Broad, 18 to 45', spend: 2600, leads: 76, cpl: 34, note: 'Watch quality.' },
            { name: 'IG engagers, 90 days', spend: 1200, leads: 43, cpl: 28, note: 'Cheap and warm.' }
          ],
          actions: [
            { id: 'a1', title: 'Launch transformation reel', why: 'Needed a stronger hook for June intake.', owner: 'EFG · Mia', priority: 'High', due: 'Done 9 Jun', status: 'done', impact: 'Became best ad within days.', keep: true },
            { id: 'a2', title: 'Agree July plan', why: 'Monthly review.', owner: 'You · Sarah', priority: 'High', due: 'Done 30 Jun', status: 'done', impact: 'July locked.', keep: true },
            { id: 'a3', title: 'Tighten broad audience', why: 'CPL creeping in the last fortnight.', owner: 'EFG · Mia', priority: 'High', due: 'Carried to July', status: 'week', impact: 'Protects the $30 target.', keep: true }
          ],
          changed: [
            { area: 'Sign ups', chip: 'Up 11%', detail: '260 against 234 in May, best month yet.' },
            { area: 'CPL', chip: 'Down $3', detail: '$30 against $33 in May.' },
            { area: 'Creative', chip: 'New', detail: 'Transformation reel launched 9 June.' }
          ],
          attention: [
            { issue: 'CPL crept from $29 to $33 across the month', impact: 'If the trend holds, July misses target.', step: 'Tighten the broad campaign first week of July.', priority: 'High' }
          ],
          working: [
            { title: 'Best sign up month yet', detail: '260 new members at exactly target cost.' },
            { title: 'Transformation reel found the formula', detail: 'Real members beat polished promos.' }
          ],
          notes: [
            { id: 'n1', text: 'Winter intake promo ends 31 July. August needs a new offer.', visible: true }
          ]
        },
        '2026-05': {
          label: 'May 2026', status: 'Published', updated: '1 Jun 2026, 10:00am',
          days_elapsed: 31, days_in_month: 31, budget: 7800, target_cpl: 33,
          summary: { health: 'On Track', text: 'May delivered 234 sign ups at $33 each, on target with spend $150 under budget. A solid ramp into the winter intake.', recommendation: 'Launch the transformation reel early in June.', pills: ['Budget · finished under', 'Sign ups · up on April', 'CPL · on target'] },
          metrics: { spend: 7650, leads: 234, cpl: 33, ctr: 2.8, cpc: 0.94, conv: 2.9, forecast: 7650 },
          prev: { spend: 7200, leads: 205, cpl: 35, ctr: 2.6, cpc: 0.98, conv: 2.7, label: 'April' },
          cpl_trend: [ { label: 'W4 Apr', val: 35 }, { label: 'W1 May', val: 34 }, { label: 'W2 May', val: 33 }, { label: 'W3 May', val: 32 }, { label: 'W4 May', val: 32 } ],
          campaigns: [
            { id: 'c1', name: '6 week challenge', objective: 'Leads', status: 'Active', spend: 3900, leads: 124, cpl: 31, ctr: 2.9, cpc: 0.92, health: 'strong', healthLabel: 'Strong', quality: 'Core performer.', action: 'Carry into June.' },
            { id: 'c2', name: 'Lead form · Broad', objective: 'Leads', status: 'Active', spend: 2550, leads: 70, cpl: 36, ctr: 2.3, cpc: 1.02, health: 'ok', healthLabel: 'OK', quality: 'Volume with some waste.', action: 'Watch quality.' },
            { id: 'c3', name: 'IG engagers · Retarget', objective: 'Leads', status: 'Active', spend: 1200, leads: 40, cpl: 30, ctr: 3.2, cpc: 0.84, health: 'strong', healthLabel: 'Strong', quality: 'Cheap and warm.', action: 'No change.' }
          ],
          creatives: [
            { id: 'cr1', name: 'Challenge countdown static', type: 'Image', tag: 'best', tagLabel: 'Best performer', cpl: 30, ctr: 2.6, freq: 2.4, note: 'Urgency worked for the May intake.', rec: 'Watch frequency into June.' },
            { id: 'cr2', name: 'Gym floor walkthrough', type: 'Video', tag: 'worst', tagLabel: 'Underperforming', cpl: 47, ctr: 1.3, freq: 1.8, note: 'Pretty but passive.', rec: 'Re cut with an offer up front.' }
          ],
          audiences: [ { name: 'Local radius, 5km', spend: 3900, leads: 124, cpl: 31, note: 'Core audience.' }, { name: 'Broad, 18 to 45', spend: 2550, leads: 70, cpl: 36, note: 'Some waste.' } ],
          actions: [
            { id: 'a1', title: 'Plan the June transformation reel', why: 'Needed a fresh hook for winter intake.', owner: 'EFG · Mia', priority: 'High', due: 'Done 27 May', status: 'done', impact: 'Launched 9 June, became the best ad.', keep: true }
          ],
          changed: [ { area: 'Sign ups', chip: 'Up 14%', detail: '234 against 205 in April.' }, { area: 'CPL', chip: 'Down $2', detail: '$33 against $35 in April.' } ],
          attention: [ { issue: 'Broad campaign quality thinning', impact: 'Wasted spend risk in June.', step: 'Quality watch flagged.', priority: 'Medium' } ],
          working: [ { title: 'Challenge campaign scaled cleanly', detail: '124 sign ups at $31.' } ],
          notes: [ { id: 'n1', text: 'Budget stepped up from $7,800 to $8,000 for June to support the winter intake.', visible: true } ]
        },
        '2026-08': { label: 'August 2026', status: 'Planned', budget: 9000, target_cpl: 28 }
      }
    }
  ]
};
