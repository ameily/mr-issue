## Issue statuses

`GET /issue_statuses.xml`

```json
{
    "issue_statuses": [
        {
            "id": 1, 
            "is_default": true, 
            "name": "New"
        }, 
        {
            "id": 2, 
            "name": "In Progress"
        }, 
        {
            "id": 3, 
            "name": "Resolved"
        }, 
        {
            "id": 4, 
            "name": "Feedback"
        }, 
        {
            "id": 5, 
            "is_closed": true, 
            "name": "Closed"
        }, 
        {
            "id": 6, 
            "is_closed": true, 
            "name": "Rejected"
        }
    ]
}
```

## Custom Fields

`GET /custom_fields.json`

```json
{
    "custom_fields": [
        {
            "customized_type": "issue", 
            "default_value": "", 
            "field_format": "link", 
            "id": 8, 
            "name": "Merge Request", 
            "regexp": "", 
            "roles": {}, 
            "trackers": {}, 
            "visible": true
        }, 
        {
            "customized_type": "issue", 
            "default_value": "", 
            "field_format": "list", 
            "id": 6, 
            "name": "Guest OS", 
            "possible_values": [
                {
                    "value": "Windows XP"
                }, 
                {
                    "value": "Windows Vista"
                }, 
                {
                    "value": "Windows 7"
                }, 
                {
                    "value": "Windows 8"
                }, 
                {
                    "value": "Windows 8.1"
                }
            ], 
            "regexp": "", 
            "roles": {}, 
            "trackers": {}, 
            "visible": true
        }, 
        {
            "customized_type": "issue", 
            "default_value": "", 
            "field_format": "list", 
            "id": 7, 
            "name": "Architecture", 
            "possible_values": [
                {
                    "value": "x86"
                }, 
                {
                    "value": "x64"
                }
            ], 
            "regexp": "", 
            "roles": {}, 
            "trackers": {}, 
            "visible": true
        }
    ]
}
```

## User Query

`GET /users.json?name=<name>`

```json
{
    "limit": 25, 
    "offset": 0, 
    "total_count": 1, 
    "users": [
        {
            "created_on": "2012-07-03T20:08:10Z", 
            "firstname": "Test", 
            "id": 19, 
            "last_login_on": "2015-03-03T15:08:02Z", 
            "lastname": "User", 
            "login": "test", 
            "mail": "test@test.com"
        }
    ]
}
```
