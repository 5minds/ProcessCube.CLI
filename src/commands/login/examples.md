## EXAMPLES

To log into a specific engine, provide its URL:

    $ pc login http://localhost:56000

Engines meant for development can be configured to allow anonymous root access.

To log into an engine configured to allow anonymous root access, use `--root`:

    $ pc login http://localhost:56000 --root

NOTE: Configuring engines this way is, of course, not recommended for production use!
