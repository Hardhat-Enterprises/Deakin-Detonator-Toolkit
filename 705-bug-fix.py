#BUG-FIX-705-ERROR.
#Review the " failed to create dri2" error message
# Identify the envionment(Kali Linux  on vm with windows 10)
#Each command should be run on the command line one by one for best results

#update the os (kali linux):
sudo apt update
sudo apt upgrade -y
sudo reboot

#Install/update agaraphics Drivers
sudo apt install open-vm-tools-desktop -y
sudo reboot

#Verify Direct rendering
#Install Mesa utilities
sudo apt install mesa-utils -y
#Check direct rendering status 
glxinfo | grep "direct rendering"   #Yes message will pop-up

#Install  Required graphics libraries
sudo apt install xserver_xorg-video-all -y
sudo apt install libgl1-mesa-dri -y

#Configure Xorg
sudo mv /etc/X11/xorg.conf /etc/X11/xorg.conf.backup
sudo  dpkg-reconfigure xserver-xorg    #now reboot
sudo reboot

#Set/add envionment variables
echo 'export LIBGL_DRIVERS_PATH=/usr/lib/xorg/modules/dri' >> ~/.profile
echo 'export LIBGL_DEBUG=verbose' >> ~/.profile
source ~/.profile

#Enable 3D Acceleration in VM settings
#Check and verfy kernal modules are loaded
#Review Log files
less /var/log/Xorg.0.log

#Reinstall DDT toolkit 
sudo apt-get remove --purge DDT-toolkit
sudo apt-get install DDT-toolkit
