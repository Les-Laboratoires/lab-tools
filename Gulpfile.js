import cp from "child_process"
import path from "path"
import fs from "fs"

import "dotenv/config"

import chalk from "chalk"
import dayjs from "dayjs"

const discord = await __importOrInstall("discord.js@14")
const gulp = await __importOrInstall("gulp", true)
const esbuild = await __importOrInstall("gulp-esbuild", true)
const filter = await __importOrInstall("gulp-filter", true)
const vinyl = await __importOrInstall("vinyl-paths", true)
const rename = await __importOrInstall("gulp-rename", true)
const replace = await __importOrInstall("gulp-replace", true)
const del = await __importOrInstall("del@6.1.1", true)
const log = await __importOrInstall("fancy-log", true)
const git = await __importOrInstall("git-commit-info", true)

const { Handler } = await __importOrInstall("@ghom/handler")
const { dirname } = await __importOrInstall("dirname-filename-esm")

const __dirname = dirname(import.meta)

async function __importOrInstall(packageName, importDefault = false) {
  let namespace = null

  try {
    namespace = await import(packageName.split(/\b@/)[0])
  } catch (e) {
    // eslint-disable-next-line no-undef
    console.log(
      `[${dayjs().format("HH:mm:ss")}] Package  '${chalk.cyan(packageName)}' not found. Installing...`,
    )
    try {
      await __install(packageName)
      // eslint-disable-next-line no-undef
      console.log(
        `[${dayjs().format("HH:mm:ss")}] Package  '${chalk.cyan(packageName)}' installed successfully.`,
      )
      namespace = await import(packageName.split(/\b@/)[0])
    } catch (installError) {
      throw new Error(
        `Failed to install "${packageName}": ${installError.message}`,
      )
    }
  }

  // eslint-disable-next-line no-undef
  console.log(
    `[${dayjs().format("HH:mm:ss")}] Imported '${chalk.cyan(packageName)}'`,
  )

  return importDefault ? namespace.default : namespace
}

function __install(packageName = "") {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line import/no-unresolved
    import("@esbuild/linux-x64")
      .then(() =>
        cp.exec(`npm i ${packageName}`, (err) =>
          err ? reject(err) : resolve(),
        ),
      )
      .catch(() =>
        cp.exec(`npm i ${packageName} --force`, (err) =>
          err ? reject(err) : resolve(),
        ),
      )
  })
}

function _npmInstall(cb) {
  __install().then(cb).catch(cb)
}

function _gitLog(cb) {
  const newVersion = git({ cwd: path.join(__dirname, "temp") })

  log(
    [
      `Updated  '${chalk.cyan("bot.ts")}'`,
      `[${chalk.blueBright(newVersion.shortCommit)}]`,
      `${newVersion.date} -`,
      `${chalk.grey(newVersion.message)}`,
    ].join(" "),
  )

  cb()
}

function _cleanDist() {
  return del(["dist/**/*"])
}

function _cleanTemp() {
  return del(["temp"], { force: true })
}

function _checkGulpfile(cb) {
  // eslint-disable-next-line no-undef
  fetch("https://raw.githubusercontent.com/bot-ts/framework/master/Gulpfile.js")
    .then((res) => res.text())
    .then(async (remote) => {
      const local = await fs.promises.readFile(
        path.join(__dirname, "Gulpfile.js"),
        "utf8",
      )

      if (remote !== local) {
        await fs.promises.writeFile(
          path.join(__dirname, "Gulpfile.js"),
          remote,
          "utf8",
        )

        {
          // check for new dependencies in gulpfile

          // eslint-disable-next-line no-undef
          const remotePackageJSON = await fetch(
            "https://raw.githubusercontent.com/bot-ts/framework/master/package.json",
          ).then((res) => res.json())

          const localPackageJSON = JSON.parse(
            await fs.promises.readFile(
              path.join(__dirname, "package.json"),
              "utf8",
            ),
          )

          const gulpDevDependencies = Object.entries(
            remotePackageJSON.devDependencies,
          )

          let packageJSONUpdated = false

          for (const [name, version] of gulpDevDependencies) {
            if (remote.includes(`"${name}"`) && !local.includes(`"${name}"`)) {
              log(
                `Added    '${chalk.cyan(name)}' [${chalk.blueBright(version)}]`,
              )

              localPackageJSON.devDependencies[name] = version
              packageJSONUpdated = true
            }
          }

          if (packageJSONUpdated) {
            await fs.promises.writeFile(
              path.join(__dirname, "package.json"),
              JSON.stringify(localPackageJSON, null, 2),
              "utf8",
            )

            await new Promise((resolve) => _npmInstall(resolve))
          }
        }

        log(
          `${chalk.red("Gulpfile updated!")} Please re-run the ${chalk.cyan(
            "update",
          )} command.`,
        )

        // eslint-disable-next-line no-undef
        process.exit(0)
      } else cb()
    })
    .catch(cb)
}

function _downloadTemp(cb) {
  cp.exec("git clone https://github.com/bot-ts/framework.git temp", cb)
}

function _build() {
  return gulp
    .src("src/**/*.ts")
    .pipe(
      esbuild({
        sourcemap: "inline",
        format: "esm",
        target: "node20",
        loader: { ".ts": "ts" },
      }),
    )
    .pipe(
      replace(/((?:import|export) .*? from\s+['"].*?)\.ts(['"])/g, "$1.js$2"),
    )
    .pipe(gulp.dest("dist"))
}

function _copyKeepers() {
  return gulp.src(["src/**/.keep"], { base: "src" }).pipe(gulp.dest("dist"))
}

function _watch(cb) {
  const spawn = cp.spawn("nodemon dist/index --delay 1", { shell: true })

  spawn.stdout.on("data", (data) => {
    // eslint-disable-next-line no-undef
    console.log(`${data}`.trim())
  })

  spawn.stderr.on("data", (data) => {
    // eslint-disable-next-line no-undef
    console.error(`${data}`.trim())
  })

  spawn.on("close", () => cb())

  gulp.watch("src/**/*.ts", { delay: 500 }, gulp.series(_cleanDist, _build))
}

function _overrideNativeFiles() {
  return gulp
    .src(
      [
        "temp/src/app/*.ts",
        "temp/**/*.native.ts",
        "temp/src/index.ts",
        "temp/.gitattributes",
        "temp/.gitignore",
        "temp/.eslintrc.json",
        "temp/Dockerfile",
        "temp/compose.yml",
        "temp/.github/workflows/**/*.native.*",
        "temp/template.env",
        "temp/template.md",
        "temp/tsconfig.json",
        "temp/tests/**/*.js",
        "temp/templates/*",
        "!temp/src/app/database.ts",
      ],
      { base: "temp" },
    )
    .pipe(gulp.dest(__dirname, { overwrite: true }))
}

function _copyConfig() {
  return gulp
    .src(["temp/src/config.ts"], { base: "temp" })
    .pipe(gulp.dest(__dirname, { overwrite: false }))
}

function _updatePackageJSON(cb) {
  const localPackageJSON = JSON.parse(fs.readFileSync("./package.json", "utf8"))
  const remotePackageJSON = JSON.parse(
    fs.readFileSync("./temp/package.json", "utf8"),
  )

  localPackageJSON.main = remotePackageJSON.main
  localPackageJSON.type = remotePackageJSON.type
  localPackageJSON.version = remotePackageJSON.version

  localPackageJSON.engines = {
    ...localPackageJSON.engines,
    ...remotePackageJSON.engines,
  }

  localPackageJSON.scripts = {
    ...localPackageJSON.scripts,
    ...remotePackageJSON.scripts,
  }

  localPackageJSON.imports = {
    ...localPackageJSON.imports,
    ...remotePackageJSON.imports,
  }

  for (const baseKey of ["dependencies", "devDependencies"]) {
    const dependencies = localPackageJSON[baseKey]
    const newDependencies = remotePackageJSON[baseKey]
    for (const key of Object.keys(newDependencies)) {
      if (/^(?:sqlite3|pg|mysql2)$/.test(key)) continue
      if (
        !dependencies.hasOwnProperty(key) ||
        dependencies[key] !== newDependencies[key]
      ) {
        log(
          `Updated  '${chalk.cyan(key)}' [${
            dependencies[key]
              ? `${chalk.blueBright(dependencies[key])} => ${chalk.blueBright(
                  newDependencies[key],
                )}`
              : chalk.blueBright(newDependencies[key])
          }]`,
        )
        dependencies[key] = newDependencies[key]
      }
    }
  }

  if (fs.existsSync("./package-lock.json")) fs.unlinkSync("./package-lock.json")

  fs.writeFileSync(
    "./package.json",
    JSON.stringify(localPackageJSON, null, 2),
    "utf8",
  )

  _npmInstall(cb)
}

function _updateDatabaseFile() {
  const packageJSON = JSON.parse(fs.readFileSync("./package.json", "utf8"))
  const database = ["mysql2", "sqlite3", "pg"].find(
    (name) => name in packageJSON.dependencies,
  )
  return gulp
    .src("templates/" + database)
    .pipe(rename("database.ts"))
    .pipe(gulp.dest("src/app"))
}

function _removeDuplicates() {
  return gulp
    .src([
      "src/**/*.native.ts",
      "!src/app.native.ts",
      "temp/.github/workflows/**/*.native.*",
    ])
    .pipe(
      filter((file) =>
        fs.existsSync(
          path.join(
            file.dirname,
            file.basename.replace(".native" + file.extname, file.extname),
          ),
        ),
      ),
    )
    .pipe(vinyl(del))
}

async function _generateReadme(cb) {
  /* eslint-disable @typescript-eslint/no-unused-vars */

  const client = new discord.Client({
    intents: [],
  })

  // eslint-disable-next-line no-undef
  await client.login(process.env.BOT_TOKEN)

  const avatar =
    client.user.displayAvatarURL({ format: "png", size: 128 }) +
    "&fit=cover&mask=circle"

  const config = await import("./dist/config.js").then(
    (config) => config.default,
  )

  const invitation = client.application.botPublic
    ? await client.generateInvite({
        scopes: [
          discord.OAuth2Scopes.Bot,
          discord.OAuth2Scopes.ApplicationsCommands,
        ],
        permissions: config.permissions,
      })
    : null

  await client.destroy()

  const packageJSON = JSON.parse(
    await fs.promises.readFile("./package.json", "utf8"),
  )
  const database = ["mysql2", "sqlite3", "pg"].find(
    (name) => name in packageJSON.dependencies,
  )
  const configFile = await fs.promises.readFile("./src/config.ts", "utf8")
  const template = await fs.promises.readFile("./template.md", "utf8")

  /**
   * @param dirname {string}
   * @return {Promise<Map<any>>}
   */
  const handle = async (dirname) => {
    const handler = new Handler(path.join(__dirname, "dist", dirname), {
      pattern: /\.js$/i,
      loader: async (filepath) => {
        return (await import(`file://${filepath}`)).default
      },
    })

    await handler.init()

    // crop all the paths from the root directory

    const output = new Map()

    for (const [_path, value] of handler.elements) {
      output.set(
        path
          .relative(__dirname, _path)
          .replace("dist", "./src")
          .replace(/\\/g, "/")
          .replace(/\.js$/, ".ts"),
        value,
      )
    }

    return output
  }

  const slash = await handle("slash")
  const commands = await handle("commands")
  const listeners = await handle("listeners")
  const namespaces = await handle("namespaces")
  const tables = await handle("tables")

  const readme = template.replace(/\{\{(.+?)}}/gs, (match, key) => {
    log(`Evaluated '${chalk.cyan(key)}'`)
    return eval(key)
  })

  await fs.promises.writeFile(
    // eslint-disable-next-line no-undef
    `${process.env.BOT_MODE === "factory" ? "." : ""}readme.md`,
    readme,
    "utf8",
  )

  cb()

  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export const build = gulp.series(_cleanDist, _build, _copyKeepers)
export const watch = gulp.series(build, _watch)
export const readme = gulp.series(build, _generateReadme)
export const update = gulp.series(
  _checkGulpfile,
  _cleanTemp,
  _downloadTemp,
  _overrideNativeFiles,
  _copyConfig,
  _removeDuplicates,
  _updatePackageJSON,
  _updateDatabaseFile,
  _gitLog,
  _cleanTemp,
)
