var e=`admin@techwithbrands.com`,t=typeof window<`u`?window.location.origin:`http://localhost:3000`,n=e=>`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #1e40af; margin-bottom: 20px;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${e.firstName} ${e.lastName}</p>
      <p><strong>Email:</strong> ${e.email}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p><strong>Message:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${e.message.replace(/\n/g,`<br>`)}
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">This email was sent from the WakiliWorld contact form.</p>
    </div>
  `,r=async t=>{let r=n(t);return i({to:e,subject:`WakiliWorld Enquiry: ${t.firstName} ${t.lastName}`,html:r})},i=async({to:e,subject:t,html:n,text:r})=>(console.warn(`RESEND_API_KEY not configured - email sending disabled`),{success:!1,error:`Email service not configured`}),a=()=>`verify-${Date.now()}-${Math.random().toString(36).substring(2,15)}`,o=()=>`secure-${Date.now()}-${Math.random().toString(36).substring(2,15)}${Math.random().toString(36).substring(2,15)}`,s=(e,n)=>{let r=`${t}/verify-email?token=${n}`;return`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #1e40af; margin-bottom: 20px;">Welcome to WakiliWorld</h2>
      <p>Hi ${e||`User`},</p>
      <p>Thank you for registering with WakiliWorld. Please verify your email address by clicking the button below:</p>
      <div style="margin: 30px 0;">
        <a href="${r}"
           style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${r}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">If you didn't create an account, you can ignore this email.</p>
    </div>
  `},c=(e,n)=>{let r=`${t}/reset-password/${n}`;return`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #1e40af; margin-bottom: 20px;">Password Reset Request</h2>
      <p>Hi ${e||`User`},</p>
      <p>We received a request to reset your password. Click the button below to choose a new password:</p>
      <div style="margin: 30px 0;">
        <a href="${r}"
           style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${r}</p>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">This link will expire in 24 hours.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">If you didn't request a password reset, you can ignore this email.</p>
    </div>
  `},l=async(e,t=null)=>{let n=t||a(),r=s(e.username||e.email,n);return i({to:e.email,subject:`Verify your WakiliWorld email`,html:r})},u=async(e,t)=>i({to:e,subject:`Reset your WakiliWorld password`,html:c(`User`,t)});export{u as a,i,a as n,l as o,r,o as t};