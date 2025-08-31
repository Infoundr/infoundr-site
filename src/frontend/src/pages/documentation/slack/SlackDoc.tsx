import React, { useState } from "react";

const SlackDoc: React.FC = () => {
  /** ---------------- Getting Started ---------------- */
  const gettingStartedCommands = [
    {
      command: "Hi there, how can you help me today?",
      description: "Get started with the Slack bot using this command.",
      responseImage: "/images/documentation/slack/01-getting-started.png", 
    },
  ];

  /** ---------------- AI-Powered Agents (Tabs) ---------------- */
  const [activeTab, setActiveTab] = useState("GitHub");

  const agents = [
    {
      id: "GitHub",
      name: "GitHub Agent",
      icon: "/icons/github1.png", 
      description:
        "Manage GitHub repositories, issues, and pull requests directly from Slack",
      interactions: [
        '"create an issue for the login bug"',
        '"what pull requests are currently open"',
        '"what issues have not been solved"',
      ],
      flow: [
        "Provide a statement about what you want to do",
        "The agent will ask for your GitHub token for authentication",
        "Specify which repository the agent should access to perform the action",
        "The agent will execute your request and provide results",
      ],
      images: ["/images/documentation/slack/02-github.png"], 
    },
    {
      id: "Project",
      name: "Project Management",
      icon: "/icons/taskmanagement.png",
      description: "Create and manage projects, tasks, and workflows",
      interactions: [
        '"create a task for marketing campaign"',
        '"create tasks for finishig pitch deck by tomorrow" When you want to have a deadline',
        '"create a task for community dy poster design that is to be done by Joseph" When you want to assign the task to someone',
      ],
      flow: [
        "You provide a statement of what you want to do",
        "The agent will ask for your Asana token for authentication",
        "Once authenticated, specify your project details",
        "The agent will create and manage your tasks",
      ],
      images: ["/images/documentation/slack/03-asana.png"],
    },
    {
      id: "Calendar",
      name: "Calendar Agent",
      icon: "/icons/calendar1.png",
      description: "Schedule meetings, set reminders, and manage your calendar",
      interactions: [
        '"schedule a team meeting tomorrow at 10am"',
        '"set a reminder for investor pitch on Friday"',
        '"what meetings do i have this week"',
      ],
      flow: [
        "You provide a statement about what you want to do",
        "The agent may ask you to sign in with your Google account",
        "Complete the Google OAuth authentication process",
        "The agent will manage your calendar and schedule events",
      ],
      images: ["/images/documentation/slack/04-calendar.png"],
    },
    {
      id: "Email",
      name: "Email Agent",
      icon: "/icons/mail_purple.png",
      description: "Draft emails, manage templates, and automate outreach",
      interactions: [
        '"draft an email to the investors about our latest milestone"',
        '"create a follow-up email template for customer outreach"',
        '"send a reminder email to the team about tomorrows meeting"',
      ],
      flow: [
        "You provide a statement about what you want to do",
        "The agent will ask you to sign in with Google account",
        "Complete the Google OAuth authentication process",
        "The agent will help you draft, send and manage emails",
      ],
      images: ["/images/documentation/slack/05-gmail.png"],
      extraNote:
        "Of course, it will first prompt you to sign in to your Google account, but if you already did it with the Calendar Agent, it will not prompt you again.",
    },
  ];

  const activeAgent = agents.find((a) => a.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* -------------- Hero -------------- */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
              <img
                src="/icons/slack_logo.png"
                alt="Slack"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Slack Bot Documentation
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to use our Slack bot to automate tasks, manage projects,
            and get AI-powered assistance directly in your workspace.
          </p>
        </div>

        {/* -------------- Getting Started -------------- */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Getting Started
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div >
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                1. Invite the Bot
              </h2>
              <p className="text-gray-600 mb-4">
                Add our Slack bot to your workspace using the invite link below.
              </p>
              <a
                href="https://slack.infoundr.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition-colors"
              >
                Invite to Slack
              </a>
            </div>
          </div>

          {/* Single command example with screenshot */}
          <div className="flex justify-center">
            {gettingStartedCommands.map((cmd, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Command {index + 1}:
                  </h4>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm text-gray-700 mb-3">
                    {cmd.command}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{cmd.description}</p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">
                    Bot Response:
                  </h5>
                  <img
                    src={cmd.responseImage}
                    alt={`Response to ${cmd.command}`}
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -------------- AI-Powered Agents (Tabbed like screenshot) -------------- */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            AI-Powered Agents
          </h2>

          {/* Tabs with icons */}
          <div className="flex justify-center gap-4 mb-8">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveTab(agent.id)}
                className={`px-6 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                  activeTab === agent.id
                    ? "bg-purple-100 border-purple-400 text-purple-700 font-semibold"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <img
                  src={agent.icon}
                  alt={`${agent.name} icon`}
                  className="w-5 h-5 object-contain"
                />
                {agent.name}
              </button>
            ))}
          </div>

          {/* Active Agent Panel */}
          {activeAgent && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <img
                    src={activeAgent.icon}
                    alt={activeAgent.name}
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {activeAgent.name}
                  </h3>
                  <p className="text-gray-600">{activeAgent.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Example Interactions */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Example Interactions
                  </h4>
                  <div className="space-y-3">
                    {activeAgent.interactions.map((ex, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm"
                      >
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interaction Flow */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Interaction Flow
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    {activeAgent.flow.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Screenshots (Slack UI with avatars inside the images) */}
              {activeAgent.images.map((img, i) => (
                <div key={i} className="mb-6">
                  <img
                    src={img}
                    alt={`${activeAgent.name} example`}
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              ))}

              {/* Email Agent extra note */}
              {activeAgent.extraNote && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  {activeAgent.extraNote}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlackDoc;
