# WakiliWorld CRM - Deployment & Licensing Guide

## 🚀 DEPLOYMENT INSTRUCTIONS

### Prerequisites

- Node.js 16+
- npm or yarn
- Web server (Apache/Nginx/Express)
- SSL certificate (HTTPS required for production)

### Installation Steps

1. **Clone Repository**

   ```bash
   git clone [repository-url]
   cd wakiliworld-crm
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Build for Production**

   ```bash
   npm run build
   # Add obfuscation for IP protection
   npm install --save-dev webpack-obfuscator
   npm run build:obfuscated
   ```

4. **Deploy Files**
   - Upload `dist/` folder to web server
   - Configure HTTPS redirect
   - Set up domain binding

5. **License Activation**
   - Access admin panel
   - Generate license key for client
   - Provide activation instructions

## 🔐 LICENSE MANAGEMENT WORKFLOW

### For New Clients

1. **Client Onboarding**
   - Receive payment (Mpesa/KCB)
   - Confirm payment receipt
   - Generate license key via Admin Dashboard

2. **License Generation**

   ```javascript
   // In Admin Dashboard → License Management
   // Generate key with client details
   // Set expiry (12 months from activation)
   // Bind to client domain/installation
   ```

3. **Client Activation**
   - Send license key + activation guide
   - Client enters key in Settings
   - System validates and activates

4. **Ongoing Management**
   - Monitor usage via admin dashboard
   - Send renewal reminders (30 days before expiry)
   - Process quarterly maintenance payments

### License Key Format

```
TWB-LF-XXXX-XXXX-XXXX-XXXX
```

Example: `TWB-LF-A1B2-C3D4-E5F6-G7H8`

## 💰 PRICING & PAYMENT PROCESSING

### Current Pricing (Kenyan Market)

- **Tier 1 (Solo)**: KES 150,000 initial + 25,000/quarter
- **Tier 2 (Standard)**: KES 300,000 initial + 40,000/quarter
- **Tier 3 (Enterprise)**: KES 500,000 initial + 60,000/quarter

### Payment Collection

- **Mpesa Till**: 8352474 (Anthony Kerige/TwB)
- **KCB Account**: 1261709403 (Tech with Brands)
- **Invoice Generation**: Automatic via system
- **Payment Confirmation**: Manual in admin dashboard

### Revenue Tracking

- System tracks all license sales
- Quarterly maintenance revenue
- Payment status monitoring
- Automated renewal reminders

## 🔒 SECURITY FEATURES IMPLEMENTED

### Client-Side Protections

- ✅ License key validation
- ✅ Hardware fingerprinting
- ✅ Domain binding
- ✅ Trial period enforcement
- ✅ Grace period handling
- ✅ Tamper detection (basic)
- ✅ Watermarking (console + UI)

### Admin Controls

- ✅ License generation & management
- ✅ Payment status tracking
- ✅ License revocation
- ✅ Usage monitoring
- ✅ Renewal processing

### IP Protection

- ✅ Source code obfuscation (build-time)
- ✅ No sensitive data in client bundle
- ✅ Encrypted local storage
- ✅ Anti-debugging measures

## ⚠️ SECURITY GAPS & RECOMMENDATIONS

### Critical (Must Fix Before Production)

1. **Server-side validation** - Implement `/api/license/validate` endpoint
2. **Encrypted license storage** - Move license data to server
3. **Code integrity checks** - Add build-time verification

### High Priority

1. **Advanced obfuscation** - Use commercial obfuscator
2. **Usage analytics** - Track feature usage patterns
3. **Remote revocation** - Instant license disabling

### Medium Priority

1. **Multi-factor activation** - Email + SMS verification
2. **Audit logging** - Track all license operations
3. **Backup recovery** - License recovery system

## 📋 CLIENT ONBOARDING CHECKLIST

- [ ] Payment received and confirmed
- [ ] Client details collected (name, email, domain)
- [ ] License key generated with appropriate tier
- [ ] Installation ID recorded for binding
- [ ] Activation email sent with instructions
- [ ] Client confirms successful activation
- [ ] Admin dashboard shows active license
- [ ] Renewal reminder scheduled (11 months)
- [ ] Support contact information provided

## 🆘 TROUBLESHOOTING

### Common Issues

**License Key Rejected**

- Verify key format: `TWB-LF-XXXX-XXXX-XXXX-XXXX`
- Check expiry date not in past
- Ensure client name matches exactly

**Activation Fails**

- Clear browser cache and localStorage
- Try different browser
- Check network connectivity
- Verify installation ID matches

**Admin Access Lost**

- Use recovery console: `recoverAdmin.fixRole()`
- Or update Supabase user_metadata: `{"role": "admin"}`

## 📞 SUPPORT & MAINTENANCE

### Support Channels

- **Email**: support@techwithbrands.com
- **Phone**: +254 700 000 000
- **Response Time**: 24 hours (business days)

### Maintenance Schedule

- **Quarterly Updates**: Feature enhancements + security patches
- **Emergency Patches**: Critical security issues - within 24 hours
- **Major Releases**: Every 6 months with advance notice

---

## 📈 BUSINESS METRICS TO TRACK

1. **License Sales**: Monthly revenue from new licenses
2. **Maintenance Revenue**: Quarterly recurring income
3. **Churn Rate**: License renewals vs expirations
4. **Client Satisfaction**: Support ticket resolution time
5. **Usage Analytics**: Feature adoption rates
6. **Market Penetration**: Number of law firms using system

---

_This deployment guide ensures secure, scalable delivery of WakiliWorld CRM while protecting your intellectual property and ensuring consistent revenue streams._

**Owner**: Anthony Kerige (Tony Kamau)  
**Company**: Tech with Brands (TwB)  
**Contact**: support@techwithbrands.com
