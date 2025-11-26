# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at Pingly. If you discover a security vulnerability, please follow these steps:

### Do NOT:
- Open a public GitHub issue
- Disclose the vulnerability publicly before it's fixed

### Do:
1. **Email us** at security@pingly.kr (or the appropriate security contact)
2. **Include** in your report:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to expect:
- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours
- **Status Update**: Every 7 days until resolved
- **Resolution**: Typically within 90 days

### Reward
We appreciate responsible disclosure. Depending on the severity, we may offer:
- Public acknowledgment (with your permission)
- Pingly credits or subscription time
- Security researcher recognition

## Security Measures

### Code Security
- All code is reviewed before merging
- Automated security scanning on every PR
- Regular dependency audits

### Data Protection
- Encryption at rest and in transit
- Regular security audits
- Access controls and authentication

### Infrastructure
- Regular patching and updates
- Network segmentation
- Monitoring and alerting

## Security Best Practices for Contributors

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Never trust user data
3. **Use parameterized queries** - Prevent SQL injection
4. **Escape outputs** - Prevent XSS attacks
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Follow least privilege** - Request minimal permissions

## Contact

For security concerns: security@pingly.kr
