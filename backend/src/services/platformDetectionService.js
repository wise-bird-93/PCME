
const PLATFORM_RULES = [
    {
        platform: "github",
        domains: ["github.com"]
    },
    {
        platform: "instagram",
        domains: ["instagram.com"]
    },
    {
        platform: "linkedin",
        domains: ["linkedin.com"]
    },
    {
        platform: "discord",
        domains: ["discord.com"]
    },
    {
        platform: "leetcode",
        domains: ["leetcode.com"]
    },
    {
        platform: "codeforces",
        domains: ["codeforces.com"]
    }
];

function detectPlatform(sender) {
    if (!sender) return null;

    const match = sender.match(/<([^>]+)>/);
    const email = (match ? match[1] : sender).trim().toLowerCase();

    const domain = email.split("@")[1];

    if (!domain) return null;

    const rule = PLATFORM_RULES.find(platformRule =>
        platformRule.domains.some(allowedDomain =>
            domain === allowedDomain ||
            domain.endsWith(`.${allowedDomain}`)
        )
    );

    return rule ? rule.platform : null;
}


function classifyEvent(subject) {
    if (!subject) return "unknown";

    const text = subject.toLowerCase();

    const EVENT_RULES = [
        {
            type: "login_alert",
            patterns: [/new sign.?in/, /new login/, /logged in/, /sign.?in detected/]
        },
        {
            type: "verification",
            patterns: [/verification code/, /verify your email/, /confirm your email/, /one.?time password/, /\botp\b/]
        },
        {
            type: "password_reset",
            patterns: [/password reset/, /reset your password/, /password changed/]
        },
        {
            type: "security_alert",
            patterns: [/security alert/, /suspicious activity/, /unusual activity/, /account security/]
        },
        {
            type: "account_update",
            patterns: [/account updated/, /profile updated/, /email address changed/]
        }
    ];

    for (const rule of EVENT_RULES) {
        if (rule.patterns.some(pattern => pattern.test(text))) {
            return rule.type;
        }
    }

    return "unknown";
}

module.exports = { detectPlatform, classifyEvent };
