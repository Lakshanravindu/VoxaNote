import { Resend } from 'resend';
import { RESEND_API_KEY, FROM_EMAIL, APP_NAME, APP_URL } from '@/lib/env';

const resend = new Resend(RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail({ to, subject, html, text, from = FROM_EMAIL }: EmailOptions) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || text,
        text
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // OTP Verification Email
  async sendOTPEmail(email: string, otp: string, firstName?: string) {
    const subject = `${APP_NAME} - Email Verification Code`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8fafc; }
            .otp-code { 
              font-size: 32px; 
              font-weight: bold; 
              color: #3b82f6; 
              text-align: center; 
              margin: 20px 0; 
              padding: 20px;
              background: white;
              border-radius: 8px;
              letter-spacing: 4px;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VertoNote</h1>
              <p>Email Verification Required</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName || 'there'}!</h2>
              <p>Welcome to VertoNote! Please verify your email address by entering the following code:</p>
              
              <div class="otp-code">${otp}</div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This code will expire in 15 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
              
              <p>After verification, your account will be reviewed by our admin team (usually within 24-48 hours).</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 VertoNote. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Account Approval Email
  async sendApprovalEmail(email: string, firstName: string, approved: boolean) {
    const subject = approved 
      ? `${APP_NAME} - Account Approved! Welcome aboard 🎉`
      : `${APP_NAME} - Account Application Update`;

    const html = approved ? `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Account Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8fafc; }
            .button { 
              display: inline-block; 
              background: #3b82f6; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to VertoNote!</h1>
            </div>
            <div class="content">
              <h2>Congratulations, ${firstName}!</h2>
              <p>Your VertoNote account has been approved! You can now access all features of our platform.</p>
              
              <p><strong>What you can do now:</strong></p>
              <ul>
                <li>Read unlimited articles in Sinhala and English</li>
                <li>Bookmark your favorite content</li>
                <li>Comment and engage with the community</li>
                <li>Get AI-powered reading recommendations</li>
                <li>Track your reading progress and achievements</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${APP_URL}/auth/login" class="button">Start Reading Now</a>
              </div>
              
              <p>Thank you for joining our community of readers and learners!</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 VertoNote. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Account Application Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8fafc; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Application Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName},</h2>
              <p>Thank you for your interest in VertoNote. Unfortunately, we're unable to approve your account at this time.</p>
              
              <p>This could be due to:</p>
              <ul>
                <li>Incomplete profile information</li>
                <li>Current capacity limitations</li>
                <li>Other administrative reasons</li>
              </ul>
              
              <p>You're welcome to apply again in the future. If you have questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 VertoNote. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Password Reset Email
  async sendPasswordResetEmail(email: string, resetToken: string, firstName?: string) {
    const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;
    const subject = `${APP_NAME} - Password Reset Request`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8fafc; }
            .button { 
              display: inline-block; 
              background: #3b82f6; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VertoNote</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName || 'there'}!</h2>
              <p>You requested a password reset for your VertoNote account. Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 VertoNote. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // Writer Application Notification (to admin)
  async sendWriterApplicationEmail(userEmail: string, userName: string) {
    const subject = `${APP_NAME} - New Writer Application`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Writer Application</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f8fafc; }
            .button { 
              display: inline-block; 
              background: #3b82f6; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VertoNote Admin</h1>
              <p>New Writer Application</p>
            </div>
            <div class="content">
              <h2>New Writer Application Received</h2>
              <p><strong>User:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
              
              <p>A user has applied to become a writer. Please review their application in the admin dashboard.</p>
              
              <div style="text-align: center;">
                <a href="${APP_URL}/admin/writers/pending" class="button">Review Application</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 VertoNote Admin System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: 'admin@vertonote.com', subject, html });
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
