import { spawnSync } from "child_process"

export default function loader(source) {
  const result = spawnSync('ruby', ['-e require "./rb2js.config.rb"; puts Ruby2JS::Loader.process(ARGF.read)'], { input: source });

  return result.stdout;
}
