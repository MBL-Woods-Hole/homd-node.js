
Currently using 'Pino' (develpoment only 2026-07-28)
https://github.com/pinojs/pino

Have set to replace 'console.log' (and 'console.error')
with logger.info, logger.warn and logger.error

When homd-node.js app is started using systemd (sudo systemctl restart homd)
logging (stdout and stderr) is set to the logfiles listed in the systemd conf files.
Currently Development is /mnt/efs/homd_dev/homd_dev_std(err)out.log
And Production is /mnt/efs/homd_v42/homd_v42_std(err)out.log

Pino also allows logging to another file for (
development only (`pino_logfile` in apps.js and `pino_conf()` in helpers.js)
