type Role = "viewer" | "editor" | "admin";

interface Document {
  id: string;
  workspaceId: string;
  ownerId: string;
}

interface Membership {
  userId: string;
  workspaceId: string;
  role: Role;
}

const permissionCache = new Map<string, boolean>();

export async function canEditDocument(
  userId: string,
  documentId: string,
  getDocument: (id: string) => Promise<Document | null>,
  getMembership: (
    userId: string,
    workspaceId: string
  ) => Promise<Membership | null>
): Promise<boolean> {
  const cached = permissionCache.get(documentId);

  if (cached !== undefined) {
    return cached;
  }

  const document = await getDocument(documentId);

  if (!document) {
    return false;
  }

  const membership = await getMembership(
    userId,
    document.workspaceId
  );

  const allowed =
    document.ownerId === userId ||
    membership?.role !== "viewer";

  permissionCache.set(documentId, allowed);

  return allowed;
}

export async function canDeleteDocument(
  userId: string,
  documentId: string,
  getDocument: (id: string) => Promise<Document | null>,
  getMembership: (
    userId: string,
    workspaceId: string
  ) => Promise<Membership | null>
): Promise<boolean> {
  return canEditDocument(
    userId,
    documentId,
    getDocument,
    getMembership
  );
}
