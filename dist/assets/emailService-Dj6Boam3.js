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
  `,r=async t=>{let r=n(t);return i({to:e,subject:`WakiliWorld Enquiry: ${t.firstName} ${t.lastName}`,html:r})},i=async({to:e,subject:t,html:n,text:r})=>(console.warn(`RESEND_API_KEY not configured - email sending disabled`),{success:!1,error:`Email service not configured`}),a=()=>`verify-${Date.now()}-${Math.random().toString(36).substring(2,15)}`,o=()=>`secure-${Date.now()}-${Math.random().toString(36).substring(2,15)}${Math.random().toString(36).substring(2,15)}`,s=(e,n,r)=>{let i=`${t}/client-register?token=${r}`;return`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">WakiliWorld</h1>
        <p style="color: #8b5cf6; margin: 5px 0 0 0;">Legal CRM Platform</p>
      </div>
      <h2 style="color: #1e40af; margin-bottom: 20px;">You're Invited!</h2>
      <p>Hi ${n||`there`},</p>
      <p><strong>${e}</strong> has invited you to join WakiliWorld as their client.</p>
      <p>WakiliWorld helps legal professionals manage cases, documents, tasks, and billing - all in one place.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${i}"
           style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${i}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        If you don't know ${e}, you can safely ignore this email.<br>
        © ${new Date().getFullYear()} WakiliWorld - Tech with Brands
      </p>
    </div>
  `},c=async({clientEmail:e,clientName:t,inviterName:n,inviteToken:r})=>{let a=s(n,t,r);return i({to:e,subject:`${n} invited you to WakiliWorld`,html:a})},l=(e,n,r,i)=>{let a=`${t}/employee-register?token=${i}`;return`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0;">WakiliWorld</h1>
        <p style="color: #8b5cf6; margin: 5px 0 0 0;">Legal CRM Platform</p>
      </div>
      <h2 style="color: #1e40af; margin-bottom: 20px;">You're Invited to Join a Law Firm!</h2>
      <p>Hi ${n||`there`},</p>
      <p><strong>${e}</strong> has invited you to join their law firm on WakiliWorld as a <strong>${r||`employee`}</strong>.</p>
      <p>WakiliWorld helps legal teams manage cases, documents, tasks, and billing - all in one place.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${a}"
           style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${a}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        If you don't know ${e}, you can safely ignore this email.<br>
        © ${new Date().getFullYear()} WakiliWorld - Tech with Brands
      </p>
    </div>
  `},u=async({employeeEmail:e,employeeName:t,inviterName:n,role:r,inviteToken:a})=>{let o=l(n,t,r,a);return i({to:e,subject:`${n} invited you to join their law firm`,html:o})},d=(e,n)=>{let r=`${t}/verify-email?token=${n}`;return`
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
  `},f=(e,n)=>{let r=`${t}/reset-password/${n}`;return`
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
  `},p=async(e,t=null)=>{let n=t||a(),r=d(e.username||e.email,n);return i({to:e.email,subject:`Verify your WakiliWorld email`,html:r})},m=async(e,t)=>i({to:e,subject:`Reset your WakiliWorld password`,html:f(`User`,t)});export{i as a,p as c,r as i,a as n,u as o,c as r,m as s,o as t};