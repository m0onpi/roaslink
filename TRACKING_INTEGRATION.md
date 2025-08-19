# SmartDirect Tracking Integration Guide

## 🚀 Quick Start

Add the following script tag to your website's `<head>` section or before the closing `</body>` tag:

```html
<script src="https://roaslink.co.uk/api/script?domain=yourdomain.com"></script>
```

**Replace `yourdomain.com` with your actual domain.**

## 📋 Integration Examples

### Basic Integration
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
    <!-- SmartDirect Tracking -->
    <script src="https://roaslink.co.uk/api/script?domain=example.com"></script>
</head>
<body>
    <!-- Your website content -->
</body>
</html>
```

### Debug Mode (for testing)
```html
<script src="https://roaslink.co.uk/api/script?domain=example.com&debug=true"></script>
```

### Using Data Attributes (Alternative Method)
```html
<script 
  src="https://roaslink.co.uk/api/script?domain=example.com" 
  data-domain="example.com"
  data-debug="false">
</script>
```

## 🎯 What Gets Tracked

The script automatically tracks:

- **Page Views**: When users visit pages
- **Clicks**: User interactions with elements
- **Form Submissions**: When forms are submitted
- **Scroll Depth**: How far users scroll (25%, 50%, 75%, 90%)
- **Session Events**: Page hide/show, session timeout
- **Exit Events**: When users leave pages

## 🔧 Configuration Options

### URL Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `domain` | ✅ Yes | Your website domain | `domain=example.com` |
| `debug` | ❌ No | Enable debug logging | `debug=true` |

### Data Attributes

| Attribute | Description | Values |
|-----------|-------------|--------|
| `data-domain` | Override domain | `"example.com"` |
| `data-debug` | Enable debug mode | `"true"` or `"false"` |

## 🛠️ Testing Your Integration

### 1. Enable Debug Mode
Add `&debug=true` to your script URL:
```html
<script src="https://roaslink.co.uk/api/script?domain=example.com&debug=true"></script>
```

### 2. Check Browser Console
Open browser DevTools (F12) and look for:
```
[SmartDirect Tracking] Tracking script loaded { domain: "example.com", sessionId: "session_...", apiEndpoint: "..." }
[SmartDirect Tracking] Tracking event { eventType: "page_view", ... }
[SmartDirect Tracking] Tracking success OK
```

### 3. Test Basic Connectivity
Run this in your browser console:
```javascript
fetch('https://roaslink.co.uk/api/tracking/diagnose')
  .then(r => r.json())
  .then(console.log);
```

## 🚨 Troubleshooting

### Common Issues

#### 1. No tracking data appears
- ✅ Check domain is correctly spelled in script URL
- ✅ Ensure domain is registered and active in SmartDirect dashboard
- ✅ Verify subscription is active

#### 2. CORS errors in console
- ✅ Use the new `/api/script` endpoint (not `/api/tracking/script`)
- ✅ Ensure you're using the exact domain from your dashboard

#### 3. Debug mode not working
- ✅ Add `&debug=true` to script URL
- ✅ Check browser console is open
- ✅ Try refreshing the page

### Debug Commands

Test connectivity:
```javascript
// Test GET request
fetch('https://roaslink.co.uk/api/tracking/diagnose')
  .then(r => r.json())
  .then(console.log);

// Test POST request
fetch('https://roaslink.co.uk/api/tracking/diagnose', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'data' })
})
  .then(r => r.json())
  .then(console.log);
```

## 🔐 Security & Privacy

- **Domain Validation**: Only registered domains can send tracking data
- **Session-based**: Uses sessionStorage for session management
- **No Personal Data**: Tracks behavior, not personal information
- **HTTPS Only**: All communication encrypted

## 📊 Data Collected

### Automatically Collected
- Page URL and title
- User agent
- Referrer
- Session ID
- Timestamp
- Event type (page_view, click, etc.)

### Event-Specific Data
- **Clicks**: Element selector, text, position
- **Forms**: Field count, form ID/class
- **Scrolling**: Depth percentage
- **Sessions**: Start/end times, duration

## 🔄 Migration from Old Script

If you're using the old tracking script, update your integration:

### Old Method ❌
```html
<script src="https://roaslink.co.uk/api/tracking/script?domain=example.com"></script>
```

### New Method ✅
```html
<script src="https://roaslink.co.uk/api/script?domain=example.com"></script>
```

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Test with debug mode enabled
3. Verify your domain registration
4. Contact support with console error details

## 🔄 Updates

This script is automatically updated. No manual updates required.

---

**Note**: Ensure your domain is registered and has an active subscription in your SmartDirect dashboard before implementing tracking.
