# Gitlab Web Hooks

## Merge request: Open

```json
{
    object_kind:'merge_request',
    user:{
        name:'Adam Meily',
        username:'meilya',
        avatar_url:'...'
    },
    object_attributes:{
        id:166,
        target_branch:'master',
        source_branch:'branch2',
        source_project_id:82,
        author_id:6,
        assignee_id:null,
        title:'Branch2',
        created_at:'2015-03-04 15:50:38 UTC',
        updated_at:'2015-03-04 15:50:38 UTC',
        milestone_id:null,
        state:'opened',
        merge_status:'unchecked',
        target_project_id:82,
        iid:2,
        description:'closes #111111111',
        position:0,
        locked_at:null,
        source:{
            name:'TestProject',
            ssh_url:'...',
            http_url:'...',
            namespace:'meilya',
            visibility_level:0
        },
        target:{
            name:'TestProject',
            ssh_url:'...',
            http_url:'...',
            namespace:'meilya',
            visibility_level:0
        },
        last_commit:{
            id:'5c73f27b85b0c59d41765ae8b19580fe9e430ac7',
            message:'updated redmine; closes #1111111\n',
            timestamp:'2015-03-04T10:41:14-05:00',
            url:'...',
            author:{
                name:'Adam Meily',
                email:'...'
            }
        },
        url:null,
        action:'open'
    }
}
```

## Merge request: Merged

```json
{
    object_kind:'merge_request',
    user:{
        name:'Adam Meily',
        username:'meilya',
        avatar_url:'...'
    },
    object_attributes:{
        id:71,
        target_branch:'master',
        source_branch:'asdf',
        source_project_id:82,
        author_id:6,
        assignee_id:6,
        title:'Asdf',
        created_at:'2015-01-27 14:48:20 UTC',
        updated_at:'2015-03-04 15:37:25 UTC',
        milestone_id:null,
        state:'merged',
        merge_status:'can_be_merged',
        target_project_id:82,
        iid:1,
        description:'Hey\r\n\r\ncloses #2534',
        position:0,
        locked_at:null,
        source:{
            name:'TestProject',
            ssh_url:'...',
            http_url:'...',
            namespace:'meilya',
            visibility_level:0
        },
        target:{
            name:'TestProject',
            ssh_url:'...',
            http_url:'...',
            namespace:'meilya',
            visibility_level:0
        },
        last_commit:{
            id:'a486884f5282bcb431df248784ef506164f52a74',
            message:'updated readme\n',
            timestamp:'2015-01-27T09:47:14-05:00',
            url:'...',
            author:[Object]
        },
        url:null,
        action:'open'
    }
}
```

## Merge request: Closed

```json
{
    object_kind:'merge_request',
    user:{
        name:'Adam Meily',
        username:'meilya',
        avatar_url:'...'
    },
    object_attributes:{
        id:166,
        target_branch:'master',
        source_branch:'branch2',
        source_project_id:82,
        author_id:6,
        assignee_id:6,
        title:'Branch2',
        created_at:'2015-03-04 15:50:38 UTC',
        updated_at:'2015-03-04 15:54:21 UTC',
        milestone_id:null,
        state:'closed',
        merge_status:'can_be_merged',
        target_project_id:82,
        iid:2,
        description:'closes #111111111',
        position:0,
        locked_at:null,
        source:{
            name:'TestProject',
            ssh_url:'...',
            http_url:'...',
            namespace:'meilya',
            visibility_level:0
        },
        target:{
            name:'TestProject',
            ssh_url:'...',
            http_url:'.',
            namespace:'meilya',
            visibility_level:0
        },
        last_commit:{
            id:'5c73f27b85b0c59d41765ae8b19580fe9e430ac7',
            message:'updated redmine; closes #1111111\n',
            timestamp:'2015-03-04T10:41:14-05:00',
            url:'...',
            author:{
                name:'Adam Meily',
                email:'...'
            }
        },
        url:null,
        action:'update'
    }
}
```

## Merge request: Upate

```json
{
    object_kind:'merge_request',
    user:{
        name:'Adam Meily',
        username:'meilya',
        avatar_url:'...'
    },
    object_attributes:{
        id:166,
        target_branch:'master',
        source_branch:'branch2',
        source_project_id:82,
        author_id:6,
        assignee_id:6,
        title:'Branch2',
        created_at:'2015-03-04 15:50:38 UTC',
        updated_at:'2015-03-04 15:53:18 UTC',
        milestone_id:null,
        state:'opened',
        merge_status:'can_be_merged',
        target_project_id:82,
        iid:2,
        description:'closes #111111111',
        position:0,
        locked_at:null,
        source:{
            name:'TestProject',
            ssh_url:'...',
            http_url:'...',
            namespace:'meilya',
            visibility_level:0
        },
        target:{
            name:'TestProject',
            ssh_url:'...',
            http_url:'...',
            namespace:'meilya',
            visibility_level:0
        },
        last_commit:{
            id:'5c73f27b85b0c59d41765ae8b19580fe9e430ac7',
            message:'updated redmine; closes #1111111\n',
            timestamp:'2015-03-04T10:41:14-05:00',
            url:'...',
            author:{
                name:'Adam Meily',
                email:'...'
            }
        },
        url:null,
        action:'update'
    }
}
```

# Redmine REST API

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
