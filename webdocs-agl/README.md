Introduction
============

This repository contains AGL documentation website sources, rendering is visible at http://docs.automotivelinux.org
This website relies on the generator located in doctools/webdocs.

Installing
==========

## dependencies: webdoc

See how to install webdocs: read file in doctools/webdocs/README.md

## configure webdoc

Some default configuration options can be overridden in the project directory. For this, you can adjust the configuration file conf/AppDefaults.js

Other configuration files in conf/ starting by an underscore (_) are used by Jekyll. Some options may also be adjusted in particular in conf/_config.yml.

## generate a 1st site from your template
```
 ../doctools/webdocs/docbuild --clean  # deleted all generated file if any
 ../doctools/webdocs/docbuild --fetch [--force]  # collect doc from github (fetch list in site/_tocs/*/fetch_files.yml)
 ../doctools/webdocs/docbuild --build --serve --watch --incremental # build config/tocs, generate html and start a local webserver

 xdg-open http://localhost:4000

 ../doctools/webdocs/docbuild --push --verbose # push generated to production webserver (check conf/AppDefault 1st)
```

Alternatively, a Makefile can be used and defines the most common operations:
```
 make fetch
 make build
 make push
 make serve
 make clean
```

## start writing documentation

- the directory ./site holds your website content
- site/* directories not prefixed with "_" represent en entry within the menu
- site/_* directories contain template, configuration, options used by Jekyll
- site/_data is a special directory that hold both static and generated files to adjust page/site values within html pages
- site/_tocs/*/toc_VERSION_LANGUAGE.yml TOC(TableOfContent) and Fetch definitions
- site/_layouts and site/_includes holds page template 
- site/static holds assets (static images, CSS etc.)

- register at https://community.algolia.com/docsearch/ and update your apikey into conf/_config.yml

## trick

- For the moment you can only build source documentation from github (automotive-grade-linux/docs-agl).  
So if you want to test localy your modification before a "pull request", just change github path with:

```
export MY_GITHUB_ACCOUNT=XXX
find ../ -name fetched_files.yml -exec sed -i "s@automotive-grade-linux/docs-agl@$MY_GITHUB_ACCOUNT/docs-agl@g" {} \;
make clean;
make fetch;
make build;
make serve;
```

## bugs

```
 --watch to automatically regenerate pages on markdown file, you should force "./build --configs" when changing TOC or versions.
```

