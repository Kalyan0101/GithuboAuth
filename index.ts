import axios from "axios";
import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
dotenv.config();


const app = express();

const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const CALLBACK_URL = "http://localhost:3000/auth/callback";

app.get("/login", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.get("/", (req, res) => {
    const githubAuth = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}&scope=read:user,user:email`;
    res.redirect(githubAuth);
});

app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;

    console.log("code", code);

    if (!code) res.status(500).json({ message: "Something went wrong" });

    const accessTokenUrl = "https://github.com/login/oauth/access_token";
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code as string,
        redirect_uri: CALLBACK_URL,
    });

    const response = await axios.post(
        accessTokenUrl,
        params,
        { headers: { Accept: "application/json" } }
    )
    const { access_token } = response.data;

    const headers = {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
    };


    const [userResponse, emailResponse] = await Promise.all([
        axios.get('https://api.github.com/user', { headers }),
        axios.get('https://api.github.com/user/emails', { headers }),
    ]);

    const user = userResponse.data;
    const email = emailResponse.data;

    console.log('Logged in user:', user.login);
    console.log('email:', email);

    res.json({
        message: 'OAuth successful!',
        user,
        email,
        access_token
    });

});

app.listen(3000, () => {
    console.log("oAuth server connected on port http://localhost:3000");
});
