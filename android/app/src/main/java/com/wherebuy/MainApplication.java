package com.wherebuy;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.beefe.picker.PickerViewPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.wherebuy.module.DeviceHelperPackage;
import com.theweflex.react.WeChatPackage;
import org.reactnative.camera.RNCameraPackage;
import cn.reactnative.modules.update.UpdatePackage;
import cn.reactnative.modules.update.UpdateContext;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {


  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new PickerViewPackage(),
            new PickerPackage(),
            new RNGestureHandlerPackage(),
            new WeChatPackage(),
            new RNCameraPackage(),
            new DeviceHelperPackage(),
            new UpdatePackage()
      );
    }

    protected String getJSMainModuleName() {
      return "index";
    }

    @Override
    protected String getJSBundleFile() {
      return UpdateContext.getBundleUrl(MainApplication.this);
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
