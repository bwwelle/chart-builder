@echo off

pushd F:\InstalledPrograms\ImageMagick-6.9.0-Q16\

convert -units PixelsPerInch "F:\GITProjects\ChartBuilder\js\ConvertImageWebService\bin\test.svg" -density 600 "F:\GITProjects\ChartBuilder\js\ConvertImageWebService\bin\test.png"