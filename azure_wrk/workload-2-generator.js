const loadtest = require("../lib/loadtest");
const configuration = require('./azure_workload_2.json');
const execSync = require('child_process').execSync;

function statusCallback(error, result, latency) {
    console.log('----');
    console.log('Current latency %j, result %j, error %j', latency);
    console.log('Request elapsed milliseconds: ', result.requestElapsed);
    console.log('Request index: ', result.requestIndex);
    console.log('Request loadtest() instance index: ', result.instanceIndex);
}

rps = configuration.rps;
rpsInterval = configuration.interval;

index = 0;

// Ingress Port fetch
ingressHost = "kubectl get po -l istio=ingressgateway -n istio-system -o jsonpath='{.items[0].status.hostIP}'"
ingressPort = "kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name==\"http2\")].nodePort}'"
const IH = execSync(ingressHost, { encoding: 'utf-8' });
const IP = execSync(ingressPort, { encoding: 'utf-8' });
console.log(IH+':'+ IP);

const options = {
    // You can pass other parameters instead of sleep below
    url: 'http://' + IH + ':' + IP + '?sleep=500',
    maxRequests: rps.reduce((a, b) => a + b, 0)*rpsInterval,
    headers: { 'Host': 'autoscale-go-2.default.example.com' },

    // starting rps can be an array or a single value
    requestsPerSecond: rps,
    concurrency: 20,
    debug:true,
    /**
     * GWU: Custom parameters
     */
    rpsInterval,
    agentKeepAlive: true,
};

loadtest.loadTest(options, function (error, result) {
    if (error) {
        return console.error('Got an error: %s', error);
    }
    console.log(result);
    console.log('Tests run successfully');
});

