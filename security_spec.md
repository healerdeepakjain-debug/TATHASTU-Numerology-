# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Catch-All**: All paths not explicitly matched (`/{document=**}`) deny all reads and writes.
2. **Identity & Verified Email Invariant**: Every standard write requires `request.auth != null && request.auth.token.email_verified == true`.
3. **Admin Lookup Invariant**: Admin privileges are verified via `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or verified runtime owner email (`healer.ddeepak.jain@gmail.com`) with `request.auth.token.email_verified == true`.
4. **Immutable Core Fields**:
   - In `tathastu_accounts/{accountId}`, `id`, `ownerUid`, `role`, and `createdAtIso` cannot be mutated by non-admin users.
   - In `tathastu_profiles/{profileId}`, `id`, `accountId`, `ownerUid`, `dob`, and `createdAtIso` are strictly immutable after creation for non-admin users, while harmonized name/mobile/partner/yoga fields are strictly validated by `isValidAstroProfileRecord(incoming())` and explicit action `affectedKeys().hasOnly(...)`.
5. **PII & Query Enforcer**: List and get operations on `tathastu_accounts` and `tathastu_profiles` require either `resource.data.ownerUid == request.auth.uid` or `isAdmin()`.
6. **Public Shared Report Split Collection (`tathastu_shared_reports/{reportId}`)**:
   - Isolates non-PII astrological report parameters from private `tathastu_accounts` / `tathastu_profiles` records.
   - Allows single-document `get` by exact validated `isValidId(reportId)` for external mobile browsers opening a shared report link or QR code (`allow list: if false;` to prevent enumeration/scraping).
   - Restricts `create`, `update`, and `delete` strictly to the authenticated owner (`ownerUid == request.auth.uid`) or `isAdmin()`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write**: `request.auth == null` attempting to create `/tathastu_accounts/acc_1` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof**: `request.auth.token.email == 'healer.ddeepak.jain@gmail.com'` with `email_verified: false` -> `PERMISSION_DENIED`.
3. **Owner UID Spoofing on Create**: `incoming().ownerUid != request.auth.uid` -> `PERMISSION_DENIED`.
4. **Shadow / Ghost Field Injection**: Adding `isSuperAdmin: true` to `/tathastu_accounts/acc_1` or `/tathastu_shared_reports/rep_1` -> Rejected by `.keys().hasOnly(...)`.
5. **ID Poisoning Attack**: 500-character or special-character document ID -> Rejected by `isValidId()`.
6. **Value Poisoning (Oversized String / Unbounded Array)**: 50KB `name` string or 50-item `healthConcerns` array -> Rejected by `data.name.size() <= 120` and `data.healthConcerns.size() <= 10`.
7. **Privilege Escalation on Account Creation**: Non-admin setting `role: 'admin'` or `isFoc: true` -> Rejected.
8. **Immutable DOB Mutation by Client/Healer**: Non-admin attempting to change `dob` on an existing `/tathastu_profiles/{profileId}` -> Rejected.
9. **Unauthorized Profile Deletion by Client/Healer**: Non-admin calling `delete` on `/tathastu_profiles/{profileId}` -> Rejected (only `isAdmin()` can delete profiles).
10. **PII Blanket Read Attack**: Authenticated user attempting `get` or `list` on another user's `/tathastu_accounts/{accountId}` -> Rejected.
11. **Shared Reports Enumeration / Scraping**: External client attempting `list` query on `/tathastu_shared_reports` -> Rejected (`allow list: if false;`).
12. **Timestamp / Immortal Field Tampering**: Updating `createdAtIso` or `ownerUid` on update across any collection -> Rejected.
