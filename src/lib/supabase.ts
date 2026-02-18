import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://tnbkbhwngfrihqiwkmcn.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjRlZmNhOTM2LTg4MjgtNGM4Ni1iZGEyLTZiMTVjYmZjOTgzMyJ9.eyJwcm9qZWN0SWQiOiJ0bmJrYmh3bmdmcmlocWl3a21jbiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxNDMzNjAzLCJleHAiOjIwODY3OTM2MDMsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.b-rpDJD2a2SAYF6wYXmEnSb-2sl0x0WsdVYHGrgOnLI';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };