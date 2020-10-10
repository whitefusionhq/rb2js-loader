import { spawnSync } from "child_process"

export default function loader(source) {
  const result = spawnSync('bundle', ['exec', 'ruby', '-e require "./rb2js.config.rb"; puts Ruby2JS::Loader.process(ARGF.read)'], { input: source });

  if (result.stderr.length > 0) {
    this.emitError(new Error(result.stderr))
  }

  return result.stdout;
}
