import mongoose from 'mongoose';

const codeSpaceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Snippet',
      trim: true,
    },
    language: {
      type: String,
      enum: ['WEB', 'JAVA'],
      default: 'WEB',
    },
    html: {
      type: String,
      default: '<!-- XMentor Web CodeSpace -->\n<div class="card">\n  <div class="badge">PRO IDE</div>\n  <h1>Welcome to CodeSpace 🚀</h1>\n  <p>Practice HTML, CSS, & JS seamlessly from any device!</p>\n  <button id="btn">Click Me!</button>\n</div>',
    },
    css: {
      type: String,
      default: `/* Custom Glassmorphic Styles */\nbody {\n  margin: 0;\n  padding: 0;\n  min-height: 100vh;\n  background: #090d16;\n  color: #e2e8f0;\n  font-family: 'Inter', system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.card {\n  background: rgba(30, 41, 59, 0.7);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(16px);\n  border-radius: 16px;\n  padding: 2.5rem;\n  text-align: center;\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);\n  max-width: 400px;\n}\n\n.badge {\n  background: linear-gradient(135deg, #3b82f6, #8b5cf6);\n  color: white;\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 0.25rem 0.75rem;\n  border-radius: 999px;\n  display: inline-block;\n  margin-bottom: 1rem;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.75rem;\n}\n\np {\n  color: #94a3b8;\n  font-size: 0.95rem;\n  line-height: 1.5;\n}\n\nbutton {\n  margin-top: 1.5rem;\n  background: #3b82f6;\n  color: white;\n  border: none;\n  padding: 0.75rem 1.5rem;\n  font-weight: 600;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\nbutton:hover {\n  background: #2563eb;\n  transform: translateY(-2px);\n}`,
    },
    js: {
      type: String,
      default: '// Interactive JavaScript\nconst btn = document.getElementById(\'btn\');\n\nbtn.addEventListener(\'click\', () => {\n  alert(\'🎉 Awesome! JavaScript is running live!\');\n});',
    },
    java: {
      type: String,
      default: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("========================================");\n        System.out.println(" Welcome to XMentor Java CodeSpace!");\n        System.out.println("========================================");\n        \n        int a = 15;\n        int b = 25;\n        int sum = a + b;\n        \n        System.out.println("Calculating: " + a + " + " + b + " = " + sum);\n    }\n}',
    },
  },
  {
    timestamps: true,
  }
);

const CodeSpace = mongoose.model('CodeSpace', codeSpaceSchema);

export default CodeSpace;
