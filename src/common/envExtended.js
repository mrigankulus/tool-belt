appModule.factory('envExtended', makeenvExtended);

function makeenvExtended(wwtEnv) {
    var envExtended = {};

    envExtended.getTargetEnvModifier = function () {
        var currentEnv = wwtEnv.getEnv();

        if (currentEnv === 'prd') {
            return '';
        } else if (currentEnv === 'tst') {
            return '-tst';
        } else {
            return '-dev';
        }
    };

    return envExtended;
}