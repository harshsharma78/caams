/**
 * Unit tests for /api/organizations route handlers.
 *
 * These tests mock NextAuth `auth()`, `dbConnect()`, and Mongoose models
 * to validate request/response behaviour in isolation.
 */

// ---------------------------------------------------------------------------
// Mocks — declared BEFORE the import of the route module
// ---------------------------------------------------------------------------

const mockAuth = jest.fn();
const mockDbConnect = jest.fn().mockResolvedValue(undefined);
const mockClearAllStatsCaches = jest.fn();

jest.mock('@/lib/auth', () => ({ auth: (...args: unknown[]) => mockAuth(...args) }));
jest.mock('@/lib/db', () => ({ dbConnect: () => mockDbConnect() }));
jest.mock('@/lib/stats-cache', () => ({
  clearAllStatsCaches: () => mockClearAllStatsCaches(),
}));

const mockOrgFind = jest.fn();
const mockOrgCreate = jest.fn();
const mockAssessmentAggregate = jest.fn();

jest.mock('@/models/Organization', () => ({
  __esModule: true,
  default: {
    find: (...args: unknown[]) => mockOrgFind(...args),
    create: (...args: unknown[]) => mockOrgCreate(...args),
  },
}));

jest.mock('@/models/Assessment', () => ({
  __esModule: true,
  default: {
    aggregate: (...args: unknown[]) => mockAssessmentAggregate(...args),
  },
}));

// ---------------------------------------------------------------------------
// Import route handlers AFTER mocks are in place
// ---------------------------------------------------------------------------

import { GET, POST } from '@/app/api/organizations/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonBody(body: Record<string, unknown>) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Request;
}

const VALID_ORG_BODY = {
  name: 'Acme Corp',
  industry: 'Technology',
  size: 'sme',
  sector: 'IT Services',
  address: '123 Main Street, City',
  contactPerson: 'John Doe',
  email: 'john@acme.com',
  phone: '9876543210',
  logoUrl: '',
};

const MOCK_ORG_DOC = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  ...VALID_ORG_BODY,
  createdAt: new Date('2026-01-01'),
  logoUrl: '',
};

// ---------------------------------------------------------------------------
// GET /api/organizations
// ---------------------------------------------------------------------------

describe('GET /api/organizations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized.');
  });

  it('should return 200 with organizations for authenticated user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'admin' } });
    mockOrgFind.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([MOCK_ORG_DOC]),
      }),
    });
    mockAssessmentAggregate.mockResolvedValue([
      { _id: '507f1f77bcf86cd799439011', count: 3 },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.organizations).toHaveLength(1);
    expect(data.organizations[0].id).toBe('507f1f77bcf86cd799439011');
    expect(data.organizations[0].assessmentCount).toBe(3);
  });

  it('should return assessmentCount 0 for orgs with no assessments', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'admin' } });
    mockOrgFind.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([MOCK_ORG_DOC]),
      }),
    });
    mockAssessmentAggregate.mockResolvedValue([]); // no counts

    const res = await GET();
    const data = await res.json();

    expect(data.organizations[0].assessmentCount).toBe(0);
  });

  it('should return 500 on database error', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'admin' } });
    mockDbConnect.mockRejectedValueOnce(new Error('DB down'));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// POST /api/organizations
// ---------------------------------------------------------------------------

describe('POST /api/organizations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 403 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const res = await POST(jsonBody(VALID_ORG_BODY));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('Forbidden.');
  });

  it('should return 403 for assessor role', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'assessor' } });

    const res = await POST(jsonBody(VALID_ORG_BODY));
    expect(res.status).toBe(403);
  });

  it('should return 400 for invalid body (missing name)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'admin' } });

    const res = await POST(jsonBody({ ...VALID_ORG_BODY, name: '' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 for invalid phone number', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'admin' } });

    const res = await POST(
      jsonBody({ ...VALID_ORG_BODY, phone: 'not-a-phone' }),
    );
    expect(res.status).toBe(400);
  });

  it('should return 201 for valid admin request', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'admin' } });
    mockOrgCreate.mockResolvedValue(MOCK_ORG_DOC);

    const res = await POST(jsonBody(VALID_ORG_BODY));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.message).toBe('Organization created successfully.');
    expect(data.organization.id).toBe('507f1f77bcf86cd799439011');
  });

  it('should clear stats cache on successful creation', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'admin' } });
    mockOrgCreate.mockResolvedValue(MOCK_ORG_DOC);

    await POST(jsonBody(VALID_ORG_BODY));

    expect(mockClearAllStatsCaches).toHaveBeenCalled();
  });

  it('should return 500 on database error during creation', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'admin' } });
    mockOrgCreate.mockRejectedValueOnce(new Error('DB write failed'));

    const res = await POST(jsonBody(VALID_ORG_BODY));
    expect(res.status).toBe(500);
  });
});
