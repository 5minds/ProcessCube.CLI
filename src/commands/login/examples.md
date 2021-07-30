## EXAMPLES

To log into a specific engine, provide its URL:

    $ pc login http://localhost:56000

You can omit the protocol, if it is `http`:

    $ pc login localhost:56000

... and the host, if it is `localhost`:

    $ pc login :56000

To log into an engine using Machine to Machine (M2M) authorization, use `--m2m-client-id`/`--m2m-client-secret`:

    $ pc login http://localhost:56200 --m2m-client-id $CLIENT_ID --m2m-client-secret $CLIENT_SECRET

To log into an engine configured to use a root access token, use `--root-access-token`:

    $ pc login http://localhost:56000 --root-access-token $ROOT_ACCESS_TOKEN

NOTE: You can generate a secure token for your engine with

    $ pc generate-root-access-token

Engines meant for development can be configured to allow anonymous root access.

To log into an engine configured to allow anonymous root access, use `--root`:

    $ pc login http://localhost:56000 --root

NOTE: Configuring engines this way is, of course, not recommended for production use!
