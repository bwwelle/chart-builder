@echo off

pushd F:\InstalledPrograms\ImageMagick-6.9.0-Q16\

convert -units PixelsPerInch %1 -density 600 %2