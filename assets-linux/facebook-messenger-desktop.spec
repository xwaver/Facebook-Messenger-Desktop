Name:           facebook-messenger-desktop
Version:        1.4.3
Release:        1%{?dist}
Summary:        Native messenger.com or Facebook Messenger on your desktop

License:        MIT
URL:            https://github.com/Aluxian/Facebook-Messenger-Desktop
Source0:        Facebook-Messenger-Desktop-%{version}.tar.gz

BuildRequires:  nodejs-packaging rubygems ruby-devel gcc make npm(gulp-util) rubygem-ffi
#Requires:

%description


%prep
%setup -q -n Facebook-Messenger-Desktop-%{version}
/usr/bin/gem install fpm

%build
gulp build:linux64

%install
gulp pack:linux64:rpm
rm -rf $RPM_BUILD_ROOT


%files
%doc



%changelog
* Sun May 15 2016 Isaac Fischer
- remix for Fedora
