export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
}

export interface GroupMember {
  id: string;
  name: string;
  joinedAt: string;
}

export interface GroupDetails extends Group {
  ownerId: string;
  members: GroupMember[];
}
