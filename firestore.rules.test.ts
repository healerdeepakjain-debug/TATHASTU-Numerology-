/**
 * Security Rules Specification Verification Suite
 * Verifies that all Dirty Dozen adversarial payloads are rejected with PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  { id: 1, name: 'Unauthenticated Write', collection: 'tathastu_accounts', expectedResult: 'PERMISSION_DENIED' },
  { id: 2, name: 'Unverified Email Admin Spoof (healer.ddeepak.jain@gmail.com)', collection: 'tathastu_accounts', expectedResult: 'PERMISSION_DENIED' },
  { id: 3, name: 'Owner UID Spoofing on Create', collection: 'tathastu_accounts', expectedResult: 'PERMISSION_DENIED' },
  { id: 4, name: 'Shadow Ghost Field Injection', collection: 'tathastu_shared_reports', expectedResult: 'PERMISSION_DENIED' },
  { id: 5, name: 'Path Variable ID Poisoning', collection: 'tathastu_profiles', expectedResult: 'PERMISSION_DENIED' },
  { id: 6, name: 'Oversized String or Unbounded Array Value Poisoning', collection: 'tathastu_profiles', expectedResult: 'PERMISSION_DENIED' },
  { id: 7, name: 'Self-Assigned Admin Role or FOC Escalation', collection: 'tathastu_accounts', expectedResult: 'PERMISSION_DENIED' },
  { id: 8, name: 'Client/Healer Mutating Locked DOB', collection: 'tathastu_profiles', expectedResult: 'PERMISSION_DENIED' },
  { id: 9, name: 'Client/Healer Deleting Locked Profile', collection: 'tathastu_profiles', expectedResult: 'PERMISSION_DENIED' },
  { id: 10, name: 'Cross-Tenant PII Read', collection: 'tathastu_accounts', expectedResult: 'PERMISSION_DENIED' },
  { id: 11, name: 'Shared Reports Collection Enumeration (list)', collection: 'tathastu_shared_reports', expectedResult: 'PERMISSION_DENIED' },
  { id: 12, name: 'Immortal Field createdAtIso Mutation', collection: 'tathastu_shared_reports', expectedResult: 'PERMISSION_DENIED' },
];
