var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'samplesite@gmail.com',
        pass: process.env.EMAIL_PASSCODE,
    },
});
