'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const https = require('https');
const http = require('http');

const {
    sanitizeEntity
} = require('strapi-utils');

module.exports = {
    async find(ctx) {
        let entities;
        let range = 0;
        if (ctx.query._q) {
            entities = await strapi.services.range.search(ctx.query);
        } else {
            entities = await strapi.services.range.find(ctx.query);
        }

        console.log(entities.length)

        if (entities.length == 0) {
        	await askPorsche(ctx).then((value) => {
			  range = '[' + value + ']'
			});
        } else {
        	range = entities.map(entity => sanitizeEntity(entity, {model: strapi.models.range}).range)
        }

        return range;
    },
};

function askPorsche(ctx) {
	console.log('askPorsche')
  	return new Promise(function(resolve, reject) {
	    var params = {
	        'model': ctx.query.model,
	        'rangeunit': 'km',
	        'drivingProfile.city': ctx.query.drivingProfile_city,
	        'drivingProfile.countryRoad': ctx.query.drivingProfile_countryRoad,
	        'drivingProfile.highway': ctx.query.drivingProfile_highway,
	        'temperature.value': ctx.query.temperature_value,
	        'temperature.unit': 'C',
	        'airConditioner': ctx.query.airConditioner,
	        'rimSelection': ctx.query.rimSelection,
	        'optionalEquipment.performancePlusBattery': ctx.query.optionalEquipment_performancePlusBattery,
	        'optionalEquipment.rangeBooster': ctx.query.optionalEquipment_rangeBooster,
	        'optionalEquipment.allSeasonRims': ctx.query.optionalEquipment_allSeasonRims

	    }

	    const options = {
	        host: 'www.porsche.com',
	        path: '/range.json?' + require('querystring').stringify(params),
	        method: 'GET',
	        headers: {
	            'Content-Type': 'application/json',
	            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Mobile Safari/537.36'
	        }
	    };

	    let output = '';
	    const req = https.request(options, (res) => {
	        res.setEncoding('utf8');
	         res.on('data', (chunk) => {
	            output += chunk;
	        });
	         res.on('end', () => {
	            let obj = JSON.parse(output);
	            resolve(obj.range);
	            addRange(ctx, obj.range)
	        });
	    });

	    req.end();
  });
}

function addRange(ctx, range) {
	ctx.query.range = range
	console.log(ctx.query)
	strapi.query('range').create(ctx.query).then(() => {
		console.log('addRange ok')
	});
}
