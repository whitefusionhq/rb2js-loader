import [ spawn_sync ], from: "child_process"

export default def loader(source)
  result = spawn_sync 'bundle', ['exec', 'ruby', '-e require "./rb2js.config.rb"; puts Ruby2JS::Loader.process(ARGF.read)'], { input: source }

  self.emit_error Error.new(result.stderr) if result.stderr.length > 0

  result.stdout
end
