## EXAMPLES

Deploy a file by giving its filename:

    $ pc deploy-files registration_email_coupons.bpmn

Use multiple arguments to deploy multiple files at once:

    $ pc deploy-files registration_email_coupons.bpmn registration_fraud_detection.bpmn

Globs such as `*.bpmn` are also supported:

    $ pc deploy-files *.bpmn
