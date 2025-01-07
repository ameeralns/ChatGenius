import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendWorkspaceInvite = async (
  email: string,
  workspaceName: string,
  inviteLink: string,
  inviterName: string
) => {
  try {
    await resend.emails.send({
      from: 'ChatGenius <notifications@chatgenius.com>',
      to: email,
      subject: `You've been invited to join ${workspaceName} on ChatGenius`,
      html: `
        <div>
          <h2>You've been invited to join ${workspaceName}</h2>
          <p>${inviterName} has invited you to join their workspace on ChatGenius.</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Join Workspace
          </a>
          <p style="margin-top: 20px; color: #666;">
            This invite will expire in 7 days.
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send invite email:', error)
    throw error
  }
} 