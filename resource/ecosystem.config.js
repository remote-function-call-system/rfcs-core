module.exports = {
	apps: [{
		name: "amf-test",
		script: "./dist/app/index.js",
		watch: ["./dist/app"],
		instances: 1,
		exec_mode: "cluster_mode",
		log_date_format: "YYYY-MM-DD HH:mm Z",
		merge_logs: true,
		error_file: "./dist/log/error.log",
		out_file: "./dist/log/access.log",
		node_args: ["--no-warnings"],
		env: {
			"NODE_OPTIONS": "--no-warnings"
		}
	}]
}