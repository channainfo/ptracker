const { HandlebarsAdapter } = require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter');
const { join } = require('path');

console.log('Testing HandlebarsAdapter...');
console.log('HandlebarsAdapter:', HandlebarsAdapter);
console.log('typeof HandlebarsAdapter:', typeof HandlebarsAdapter);

try {
  const adapter = new HandlebarsAdapter();
  console.log('HandlebarsAdapter created successfully');
  console.log('Adapter methods:', Object.getOwnPropertyNames(adapter));
} catch (error) {
  console.error('Error creating HandlebarsAdapter:', error.message);
  console.error('Stack:', error.stack);
}