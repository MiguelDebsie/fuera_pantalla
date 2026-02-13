| table_name     | column_name       | data_type                | is_nullable |
| -------------- | ----------------- | ------------------------ | ----------- |
| families       | id                | uuid                     | NO          |
| families       | name              | text                     | NO          |
| families       | subscription_tier | text                     | YES         |
| families       | created_at        | timestamp with time zone | NO          |
| families       | invite_code       | text                     | YES         |
| families       | status            | text                     | YES         |
| family_alerts  | id                | uuid                     | NO          |
| family_alerts  | family_id         | uuid                     | NO          |
| family_alerts  | type              | text                     | NO          |
| family_alerts  | payload           | jsonb                    | YES         |
| family_alerts  | active_until      | timestamp with time zone | YES         |
| family_alerts  | created_at        | timestamp with time zone | NO          |
| family_members | id                | uuid                     | NO          |
| family_members | family_id         | uuid                     | NO          |
| family_members | auth_user_id      | uuid                     | YES         |
| family_members | role              | text                     | NO          |
| family_members | name              | text                     | NO          |
| family_members | pin               | text                     | YES         |
| family_members | avatar_url        | text                     | YES         |
| family_members | created_at        | timestamp with time zone | NO          |
| focus_sessions | id                | uuid                     | NO          |
| focus_sessions | user_id           | uuid                     | NO          |
| focus_sessions | start_at          | timestamp with time zone | NO          |
| focus_sessions | end_at            | timestamp with time zone | YES         |
| focus_sessions | duration          | integer                  | NO          |
| focus_sessions | distractions      | integer                  | YES         |
| focus_sessions | status            | text                     | YES         |
| focus_sessions | created_at        | timestamp with time zone | NO          |
| pets           | id                | uuid                     | NO          |
| pets           | owner_id          | uuid                     | NO          |
| pets           | species           | text                     | NO          |
| pets           | xp                | integer                  | YES         |
| pets           | level             | integer                  | YES         |
| pets           | status            | text                     | YES         |
| pets           | config            | jsonb                    | YES         |
| pets           | updated_at        | timestamp with time zone | NO          |
| pets           | name              | text                     | NO          |
| pets           | mood              | text                     | YES         |
| pets           | last_interaction  | timestamp with time zone | YES         |
| profiles       | id                | uuid                     | NO          |
| profiles       | family_id         | uuid                     | YES         |
| profiles       | role              | text                     | NO          |
| profiles       | display_name      | text                     | YES         |
| profiles       | avatar_url        | text                     | YES         |
| profiles       | pin_hash          | text                     | YES         |
| profiles       | created_at        | timestamp with time zone | NO          |