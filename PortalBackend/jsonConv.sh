#!/bin/bash
var=$1

find $var -type f -exec sed -i -e "1s/^{/[{/" -e "\$s/\}$/}]/" {} \;
find $var -type f -exec sed -i -e 's/}{/},{/g' {} \;
