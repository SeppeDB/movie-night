export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
}

export interface GroupMember {
  id: string;
  name: string;
}

export interface GroupDetails extends Group {
  members: GroupMember[];
}
