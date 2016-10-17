#!/bin/bash

cd adapters

cd APIAdapter
mfpdev adapter deploy
cd ..

cd LiveUpdateSegmentsAdapter
mfpdev adapter deploy
cd ..

cd AuthenticationAdapter
mfpdev adapter deploy
cd ..

cd ..



