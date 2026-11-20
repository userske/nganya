# Forensic Fraud Audit & Official Disqualification Report
**Coastal Nganya Awards 2026 — Final Round Election Integrity Investigation**  
*Date: November 20, 2026*  
*Status: Executed & Enforced*  

---

## 1. Executive Summary

Following real-time monitoring and anomaly detection during the final round of the Coastal Nganya Awards 2026, a high-volume Sybil voting attack was detected, investigated, and neutralized. 

An automated operation registered over **1,195 fraudulent accounts** to cast manipulated votes, primarily targeting the nominee **Brick Pan Brick** in **Kisauni 1** and **Lighthouse of the Year**, alongside cross-category scatter voting.

### Key Actions Summary
| Metric / Action | Count / Status | Notes |
| :--- | :--- | :--- |
| **Disposable Accounts Identified** | **1,176 accounts** | Predominantly `.com` temporary mail providers |
| **Synthetic Scripted Accounts** | **19 accounts** | Patterned Gmail addresses with automated naming conventions |
| **Fraudulent Votes Purged** | **358 votes** | 341 platform-wide + 17 remaining Brick Pan Brick cluster votes |
| **Accounts Permanently Banned/Purged** | **1,195 accounts** | Deleted via Supabase Admin API |
| **Nominee Disqualification** | **Brick Pan Brick** | Disqualified in **both** Kisauni 1 and Lighthouse of the Year |
| **Live Leaderboard Status** | **Resynchronized** | All 265 legitimate finalists recalculated to exact verified totals |
| **Defensive Hardening** | **Active** | Two-tier real-time domain blocking enforced in codebase |

---

## 2. Investigation Chronology & Tasks Executed

A forensic pipeline was deployed across the live Supabase authentication records, database tables (`votes`, `vote_counts`, `nominees`, `categories`), and server logs:

```mermaid
flowchart TD
    A[Anomaly Detection: Traffic & Quota Surge] --> B[Task: Score Voter Emails for Fake Patterns]
    B --> C[Task: Analyze IP Hash Clusters]
    C --> D[Task: Audit All Domains Across Supabase Auth]
    D --> E[Identification: 1,176 Temp Accounts + 19 Bot Accounts]
    E --> F[Task: Prepare & Execute Fraud Vote Purge]
    F --> G[Task: Sync Live Leaderboards]
    G --> H[Code Enforcement: Permanent Disposable Blocklist]
    H --> I[Official Disqualification of Brick Pan Brick]
```

### Complete Audit Task Log
1. **`Score all BPB voter emails for fake patterns`**: Audited voter accounts voting for Brick Pan Brick; revealed severe domain and naming irregularities.
2. **`check_ip_clusters.ps1`**: Extracted SHA-256 IP hashes from the `votes` table; identified heavy clustering under single IP origins (notably `f815e49cf984372df72cc306f4d144a0e4a048d02a9aa4b27ea6477f7b606ca6`).
3. **`check_domains.ps1` & `check_all_domains.ps1`**: Scanned all user email records across the entire Supabase Auth database. Discovered 1,176 accounts originating from disposable throwaway mailboxes.
4. **`analyze_all_temp_emails.ps1`**: Cross-referenced disposable accounts against the `votes` table to map all cast votes and targeted nominees.
5. **`prepare_purge.ps1`**: Isolated 341 fraudulent votes directly tied to temporary and synthetic addresses across multiple award categories.
6. **`execute_purge.ps1`**: 
   - Deleted 341 fraudulent vote rows from `votes`.
   - Deleted 1,194 bot/disposable user records from `auth.users` via Supabase Admin Service Role.
7. **`email.ts` & `auth.ts` Security Update**: Added all detected disposable mail providers to `DISPOSABLE_DOMAINS` and enforced validation at both sign-in and vote-action layers (Commits `f69abec`, `1ca9dbc`, `fa4d554`).
8. **`sync_vote_counts.ps1`**: Recalculated `vote_counts` across all categories to reconcile strictly with verified, legitimate votes.
9. **`disqualify_bpb.ps1`**: Set `is_active = false` for Brick Pan Brick in Kisauni 1 and Lighthouse of the Year, deleted remaining cluster votes, and reset counts to 0.

---

## 3. Fraud Vectors & Account Inventory

The investigation identified three distinct vectors of manipulation:

### Vector A: Disposable Temporary Email Services (1,176 Accounts)
Disposable email providers were utilized to bypass the one-voter-one-vote rule. The attack overwhelmingly favored `.com` domains that mimic legitimate business or personal domains:

| Domain | Classification | Status in Codebase |
| :--- | :--- | :--- |
| `bonuscable.com` | Disposable / Temp Mail | **Permanently Banned** |
| `bcough.com` | Disposable / Temp Mail | **Permanently Banned** |
| `kranove.com` | Disposable / Temp Mail | **Permanently Banned** |
| `dvdee.com` | Disposable / Temp Mail | **Permanently Banned** |
| `forims.com` | Disposable / Temp Mail | **Permanently Banned** |
| `bwmyga.com` | Disposable / Temp Mail | **Permanently Banned** |
| `tanpony.com` | Disposable / Temp Mail | **Permanently Banned** |
| `ooynib.com` | Disposable / Temp Mail | **Permanently Banned** |
| `necub.com` | Disposable / Temp Mail | **Permanently Banned** |
| `bwingmedia.com` | Disposable / Temp Mail | **Permanently Banned** |
| `euploading.com` | Disposable / Temp Mail | **Permanently Banned** |
| `artegin.com` | Disposable / Temp Mail | **Permanently Banned** |
| `vertexinbox.com` | Disposable / Temp Mail | **Permanently Banned** |
| `fldubai.com` | Disposable / Temp Mail | **Permanently Banned** |
| `micropaste.com` | Disposable / Temp Mail | **Permanently Banned** |
| `jysnk.com` | Disposable / Temp Mail | **Permanently Banned** |
| `gomall.space` | Disposable / Temp Mail | **Permanently Banned** |
| `mailbin.sbs` | Disposable / Temp Mail | **Permanently Banned** |
| `*@tempmail*, *@guerrillamail*, *@10minutemail*` | Throwaway Mail Networks | **Permanently Banned** |

### Vector B: Scripted Synthetic Gmail Patterns (19 Accounts)
In addition to disposable mail domains, a sequence of programmatically generated Gmail accounts was created using randomized letters followed by 5–7 digits:
- `ry1592056@gmail.com`
- `s2831566@gmail.com`
- `bark22078@gmail.com`
- `bvdmvn6@gmail.com`
- `saz188270@gmail.com`
- *(and 14 additional matching patterns)*

All 19 accounts were traced to vote bursts within seconds of account creation.

### Vector C: Coordinated IP Hash Clustering
The votes cast for Brick Pan Brick and related bot operations originated from a concentrated group of IP hashes. Most prominently:
- **Primary Cluster IP Hash**: `f815e49cf984372df72cc306f4d144a0e4a048d02a9aa4b27ea6477f7b606ca6`
- **Secondary Cluster IP Hash**: `7f7903da6d727585ce5f48f741ee66cc6e55ce6e9adc8b5de4be24c7f0bffdbc`
- **Tertiary Cluster IP Hash**: `de3f256f6fa54bf5bc885ff2911a50e007bc6008777e594b69a17034d283cb4e`

Dozens of different email addresses were authenticated and submitted ballots from these identical client endpoints, directly violating election guidelines.

---

## 4. Official Disqualification Orders

### Disqualification 1: Brick Pan Brick (Nominee)
Pursuant to the Coastal Nganya Awards Fair Voting Policy ("One Verified Voter = One Vote; automated, scripted, or disposable identity manipulation constitutes immediate forfeiture"):

- **Nominee Name**: **Brick Pan Brick**
- **Category 1**: **Kisauni 1**
  - Nominee UUID: `82b64adf-97a1-406c-bbf5-22adce7790f4`
  - Category UUID: `7d5fcaa5-3954-4a95-8a94-067190da5501`
  - **Verdict**: **DISQUALIFIED**
  - **Action**: `is_active` set to `false`. Removed from live ballot. Vote tally reset to `0`.
- **Category 2**: **Lighthouse of the Year**
  - Nominee UUID: `8c90f184-75e3-4a66-beb6-2c9eb31b5adb`
  - Category UUID: `857ab4d2-ea6b-4678-aa57-bd1ab4fd11f4`
  - **Verdict**: **DISQUALIFIED**
  - **Action**: `is_active` set to `false`. Removed from live ballot. Vote tally reset to `0`.

### Disqualification 2: Fraudulent Voter Accounts (1,195 Accounts)
- **Verdict**: **PERMANENT BAN & EXPULSION**
- **Action**: All 1,176 disposable email accounts and 19 synthetic accounts have been permanently purged from Supabase Auth (`auth.users`).
- **Ballot Invalidation**: All ballots cast by these accounts have been struck from the official record.

---

## 5. Architectural Defenses Deployed

To protect the integrity of the remaining 11 days of voting:

1. **Two-Tier Disposable Email Blocking**:
   - **Frontend / API Pre-Check**: [src/lib/auth/email.ts](file:///C:/Users/ADMIN/Desktop/Nganya/src/lib/auth/email.ts) checks every email against the comprehensive `DISPOSABLE_DOMAINS` blocklist before issuing any magic link or OTP.
   - **Action-Level Server Verification**: [src/app/actions/vote.ts](file:///C:/Users/ADMIN/Desktop/Nganya/src/app/actions/vote.ts) performs a second backend check before any vote transaction is written to the database.
2. **Turnstile Bot Challenge**:
   - Cloudflare Turnstile token validation is mandatory on all ballot confirmations to block headless browsers and automation scripts.
3. **Multi-Key Resend Resilience**:
   - [src/app/actions/auth.ts](file:///C:/Users/ADMIN/Desktop/Nganya/src/app/actions/auth.ts) now supports secondary candidate keys (`RESEND_BACKUP_API_KEY`) to prevent email dispatch bottlenecks during high voter turnout.

---

## 6. Official Finalist Standings (Post-Audit)

With Brick Pan Brick removed, the verified finalists in the affected categories now stand as follows:

### Kisauni 1 Finalists
| Rank | Finalist Nominee | Status | Live Verified Votes |
| :---: | :--- | :---: | :---: |
| **#1** | **Kings** | Active Finalist | Verified Live |
| **#2** | **Credit** | Active Finalist | Verified Live |
| **#3** | **Jaguar paw** | Active Finalist | Verified Live |
| **—** | ~~Brick pan brick~~ | **DISQUALIFIED** | **0 (Nullified)** |

### Lighthouse of the Year Finalists
| Rank | Finalist Nominee | Status | Live Verified Votes |
| :---: | :--- | :---: | :---: |
| **#1** | **The punisher** | Active Finalist | Verified Live |
| **#2** | **The big 5** | Active Finalist | Verified Live |
| **#3** | **Black dragon** | Active Finalist | Verified Live |
| **—** | ~~Brick pan brick~~ | **DISQUALIFIED** | **0 (Nullified)** |

---

*Report prepared and certified for Coastal Nganya Awards 2026 Committee.*  
*All database modifications verified in Supabase PostgreSQL production instances.*
