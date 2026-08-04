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
      default: '<!-- Write HTML here -->\n<div className="container">\n  <h1>Hello XMentor CodeSpace!</h1>\n</div>',
    },
    css: {
      type: String,
      default: '/* Write CSS here */\nbody {\n  font-family: system-ui, sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}',
    },
    js: {
      type: String,
      default: '// Write JavaScript here\nconsole.log("Welcome to XMentor CodeSpace!");',
    },
    java: {
      type: String,
      default: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World from Java!");\n    }\n}',
    },
  },
  {
    timestamps: true,
  }
);

const CodeSpace = mongoose.model('CodeSpace', codeSpaceSchema);

export default CodeSpace;
