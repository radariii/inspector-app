#!/bin/bash
while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -u|--username)
    USERNAME="$2"
    shift # past argument
    ;;
    -p|--password)
    PASSWORD="$2"
    shift # past argument
    ;;
    -s|--server)
    SERVER_URL="$2"
    shift # past argument
    ;;
    *)
            # unknown option
    ;;
esac
shift # past argument or value
done

echo USERNAME   = "${USERNAME}"
echo PASSWORD   = "${PASSWORD}"
echo SERVER URL = "${SERVER_URL}"

curl -X POST -u ${USERNAME}:${PASSWORD} -F file=@./adapters/live-update-adapter-deploy.zip "${SERVER_URL}/mfpadmin/management-apis/2.0/runtimes/mfp/deploy/multi"

curl -X PUT -d @liveUpdateSchema.json --user ${USERNAME}:${PASSWORD} -H "Content-Type:application/json" ${SERVER_URL}/mfpadmin/management-apis/2.0/runtimes/mfp/admin-plugins/liveUpdateAdapter/com.ibm.inspection.mfp8/schema

segments_number=$(python -c 'import json,sys;obj=json.load(sys.stdin);print len(obj["items"]);' < liveUpdateSegments.json)
counter=0
while [ $segments_number -gt $counter ]
do
    segment=$(cat liveUpdateSegments.json | python -c 'import json,sys;obj=json.load(sys.stdin);data_str=json.dumps(obj["items"]['$counter']);print data_str;')
    echo $segment | curl -X POST -d @- --user ${USERNAME}:${PASSWORD} --header "Content-Type:application/json" ${SERVER_URL}/mfpadmin/management-apis/2.0/runtimes/mfp/admin-plugins/liveUpdateAdapter/com.ibm.inspection.mfp8/segment
    ((counter++))
done
