import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWorkspaceInvite({
  email,
  inviterName,
  workspaceName,
  inviteLink
}: {
  email: string
  inviterName: string
  workspaceName: string
  inviteLink: string
}) {
  try {
    await resend.emails.send({
      from: 'Chat App <noreply@yourdomain.com>',
      to: email,
      subject: `${inviterName} invited you to join ${workspaceName}`,
      html: `
        <div>
          <h1>You've been invited to join ${workspaceName}</h1>
          <p>${inviterName} has invited you to collaborate in their workspace.</p>
          <a href="${inviteLink}" style="display: inline-block; background: #4A5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
            Join Workspace
          </a>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send invite email:', error)
    throw error
  }
} 