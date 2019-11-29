const fs = require('fs');
const yargs = require('yargs');

// This is good for local dev environments, when it's better to
// store a projects environment variables in a .gitignore'd file
require('dotenv').config();

// Would be passed to script like this:
// `ts-node set-env.ts --environment=dev`
// we get it from yargs's argv object
const environment = yargs.argv.environment;
const isProd = environment === 'prod';

const targetPath = environment === 'dev' 
    ? `./src/environments/environment.ts`
    : `./src/environments/environment.${environment}.ts`;

const envConfigFile = `
export const environment = {
  production: ${isProd},
  user: "${process.env.CHAINHUNTER_USER}",
  token: "${process.env.CHAINHUNTER_TOKEN}",
  currentUserName: "${process.env.CURRENT_USER_NAME}",
  jwtName: "${process.env.JWT_NAME}",
  jwtTsName: "${process.env.JWT_TS_NAME}",
  btc: "${process.env.BTC}",
  eth: "${process.env.ETH}",
  nano: "${process.env.NANO}",
  rvn: "${process.env.RVN}",
  squareApplicationId: "${process.env.SQUARE_APP_ID}",
  squareLocationId: "${process.env.SQUARE_LOCATION_ID}",
  squareReferralUrl: "${process.env.SQUARE_REFERRAL_URL}"
};
`

if(targetPath !== 'dev') {
	const devPath = './src/environments/environment.ts';
	fs.writeFile(devPath, envConfigFile, function (err) {
	  if (err) {
	    console.log(err);
	  }

	  console.log(`Empty ${targetPath} created`);
	});
}

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  }

  console.log(`Output generated at ${targetPath}`);
});
