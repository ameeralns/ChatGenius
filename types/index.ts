export interface Workspace {
  id: string;
  name: string;
  description: string;
  admin_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Channel {
  id: string;
  name: string;
  workspace_id: string;
  description: string;
  created_at: Date;
  updated_at: Date;
} 