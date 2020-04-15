## EXAMPLES

Deploy a file by giving its filename:

    $ atlas deploy-files registration_email_coupons.bpmn

Use multiple arguments to deploy multiple files at once:

    $ atlas deploy-files registration_email_coupons.bpmn registration_fraud_detection.bpmn

Globs such as `*.bpmn` are also supported:

    $ atlas deploy-files *.bpmn
