import { sendWelcomeEmail } from '../utils/sendEmail.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: join(__dirname, '../../.env') });

const testEmail = "hellopatel555@gmail.com";
const testName = "Hello Patel";

async function runTest() {
    console.log(`[Test] Sending welcome email to ${testEmail}...`);
    try {
        await sendWelcomeEmail(testEmail, testName);
        console.log(`[Test] SUCCESS: Email sent to ${testEmail}`);
    } catch (error) {
        console.error(`[Test] FAILED:`, error);
    }
}

runTest();
