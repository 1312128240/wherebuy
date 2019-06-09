package com.wherebuy.module;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.os.Build;
import android.view.ViewConfiguration;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;

import java.lang.reflect.Method;

/**
 * 帮助类，获取版本号、虚拟按键高度等
 */
public class DeviceHelperModule extends ReactContextBaseJavaModule {

    DeviceHelperModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DeviceHelperModule";
    }

    /**
     * 获取当前APP版本号
     * @param successCallback
     */
    @ReactMethod
    public void getAppVersion(Callback successCallback) {
        try {
            PackageInfo info = getPackageInfo();
            if(info != null){
                successCallback.invoke(info.versionName);
            }else {
                successCallback.invoke("");
            }
        } catch (IllegalViewOperationException e){
            e.printStackTrace();
        }
    }

    /**
     * 获取当前安装包信息
     */
    private PackageInfo getPackageInfo(){
        PackageManager manager = getReactApplicationContext().getPackageManager();
        PackageInfo info = null;
        try {
            info = manager.getPackageInfo(getReactApplicationContext().getPackageName(),0);
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return info;
    }

    /**
     * 获取虚拟按键的高度
     */
    @ReactMethod
    public void getNavigationBarHeight(Callback successCallback) {
        int result = -1;
        if (hasNavBar(getReactApplicationContext())) {
            Resources res = getReactApplicationContext().getResources();
            int resourceId = res.getIdentifier("navigation_bar_height", "dimen", "android");
            if (resourceId > 0) {
                result = res.getDimensionPixelSize(resourceId);
            }
        }
        successCallback.invoke(result);
    }

    /**
     * 检查是否存在虚拟按键栏
     */
    @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    private static boolean hasNavBar(Context context) {
        Resources res = context.getResources();
        int resourceId = res.getIdentifier("config_showNavigationBar", "bool", "android");
        if (resourceId != 0) {
            boolean hasNav = res.getBoolean(resourceId);
            String sNavBarOverride = getNavBarOverride();
            if ("1".equals(sNavBarOverride)) {
                hasNav = false;
            } else if ("0".equals(sNavBarOverride)) {
                hasNav = true;
            }
            return hasNav;
        } else {
            return !ViewConfiguration.get(context).hasPermanentMenuKey();
        }
    }

    /**
     * 判断虚拟按键栏是否重写
     */
    private static String getNavBarOverride() {
        String sNavBarOverride = null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            try {
                Class c = Class.forName("android.os.SystemProperties");
                Method m = c.getDeclaredMethod("get", String.class);
                m.setAccessible(true);
                sNavBarOverride = (String) m.invoke(null, "qemu.hw.mainkeys");
            } catch (Throwable e) { }
        }
        return sNavBarOverride;
    }
}
