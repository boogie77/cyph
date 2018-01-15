#!/bin/bash


dir="$PWD"
cd $(cd "$(dirname "$0")" ; pwd)/..


eval "$(./commands/getgitdata.sh)"

firebaseBackup=''
e2e=''
site=''
environment='local'
if [ "${1}" == '--firebase-backup' ] ; then
	firebaseBackup=true
	shift
fi
if [ "${1}" == '--e2e' ] ; then
	e2e=true
	shift
fi
if [ "${1}" == 'cyph.ws' ] || [ "${1}" == 'cyph.com' ] ; then
	site="${1}"
	shift
fi
args="${@}"

if [ "${e2e}" ] && [ ! "${site}" ] ; then
	fail 'Must specify a site when serving with --e2e'
fi

if [ "${firebaseBackup}" ] ; then
	environment='localBackup'
else if [ "${e2e}" ] ; then
	environment='e2e'
fi

ngserve () {
	ngserveInternal () {
		if [ "${e2e}" ] ; then
			ng e2e "${@}"
		else
			ng serve "${@}"
		fi

		return $?
	}

	project="${1}"
	shift
	port="${1}"
	shift

	cd "${project}"
	../commands/ngprojectinit.sh
	echo -e '\n\n\n'
	ngserveInternal \
		--environment "${environment}" \
		--host '0.0.0.0' \
		--live-reload false \
		--no-aot \
		--port "${port}" \
		--no-sourcemaps \
		$(if [ -f /windows ] ; then echo '--poll 1000' ; fi) \
		${args} \
		"${@}"

	return $?
}


# node /node_modules/.bin/firebase-server -p 44000 &

cp -f backend/app.yaml backend/.build.yaml

cat ~/.cyph/backend.vars >> backend/.build.yaml
if [ "${branch}" == 'prod' ] ; then
	echo '  PROD: true' >> backend/.build.yaml
	cat ~/.cyph/braintree.prod >> backend/.build.yaml
else
	cat ~/.cyph/braintree.sandbox >> backend/.build.yaml
fi

mkdir /tmp/cyph0
dev_appserver.py \
	--skip_sdk_update_check \
	--port 42000 \
	--admin_port 6000 \
	--host 0.0.0.0 \
	--storage_path /tmp/cyph0 \
	backend/.build.yaml \
&

./commands/buildunbundledassets.sh --test

log 'Starting ng serve'

for arr in 'cyph.ws 42002' 'cyph.com 42001' ; do
	read -ra arr <<< "${arr}"

	if [ ! "${site}" ] || [ "${site}" == "${arr[0]}" ] ; then
		if [ "${e2e}" ] ; then
			ngserve "${arr[0]}" "${arr[1]}"
			exit $?
		else
			ngserve "${arr[0]}" "${arr[1]}" &
			sleep 60
		fi
	fi
done

sleep Infinity
